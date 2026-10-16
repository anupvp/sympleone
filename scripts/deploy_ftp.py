"""Build SympleOne and upload the frontend and backend over FTP.

Credentials come from the environment or from sympleone/.env.deploy.
The password is never stored in this script.

    copy scripts\\deploy.env.example .env.deploy
    # set FTP_PASSWORD in .env.deploy
    python scripts\\deploy_ftp.py

Flags:
    --frontend-only   build and upload the Vite app to FTP_REMOTE_DIR
    --backend-only    upload the API source to FTP_BACKEND_DIR
    --skip-build      upload the existing frontend dist/ folder
    --dry-run         build (unless skipped) and print the upload plan
"""

from __future__ import annotations

import argparse
import ftplib
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / ".env.deploy"

BACKEND_SKIP_DIRS = {
    ".git",
    ".venv",
    "venv",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    "tests",
}
BACKEND_SKIP_FILES = {".env", ".env.deploy"}

SPA_HTACCESS = """# Browsers refuse ES modules unless .js is a JavaScript MIME type.
AddType application/javascript .js .mjs
AddType text/css .css
<FilesMatch "\\.js$">
  ForceType application/javascript
</FilesMatch>

RewriteEngine On
RewriteBase {base}
RewriteRule ^api/(.*)$ api/index.php/api/$1 [QSA,L]
RewriteRule ^index\\.html$ - [L]
RewriteCond %{{REQUEST_FILENAME}} !-f
RewriteCond %{{REQUEST_FILENAME}} !-d
RewriteRule . {base}index.html [L]
"""

BACKEND_HTACCESS = """# Keep API source from being downloaded as static files.
<IfModule mod_authz_core.c>
  Require all denied
</IfModule>
<IfModule !mod_authz_core.c>
  Deny from all
</IfModule>
"""

PASSENGER_WSGI = """import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from app.main import app as application
"""


def load_env_file(path: Path) -> None:
    if not path.is_file():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def require(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise SystemExit(
            f"Missing {name}. Set it in the environment or in {ENV_FILE}."
        )
    return value


def npm_executable() -> str:
    name = "npm.cmd" if os.name == "nt" else "npm"
    found = shutil.which(name) or shutil.which("npm")
    if not found:
        raise SystemExit("npm was not found on PATH. Install Node.js, then run this script again.")
    return found


def build_frontend(base_path: str) -> Path:
    dist = ROOT / "dist"
    env = os.environ.copy()
    env["VITE_API_BASE_URL"] = require("VITE_API_BASE_URL")
    env.setdefault("VITE_API_TIMEOUT_MS", "30000")
    env.setdefault("VITE_AUTH_RELAXED", "false")
    print(f"Building frontend with base {base_path}")
    subprocess.run(
        [npm_executable(), "run", "build", "--", "--base", base_path],
        cwd=ROOT,
        env=env,
        check=True,
    )
    if not dist.is_dir():
        raise SystemExit(f"Build did not create {dist}")
    base = base_path if base_path.endswith("/") else f"{base_path}/"
    (dist / ".htaccess").write_text(SPA_HTACCESS.format(base=base), encoding="utf-8")
    return dist


def connect() -> ftplib.FTP:
    host = require("FTP_HOST")
    user = require("FTP_USER")
    password = require("FTP_PASSWORD")
    port = int(os.environ.get("FTP_PORT", "21"))
    ftp = ftplib.FTP()
    ftp.connect(host, port, timeout=60)
    ftp.login(user, password)
    ftp.set_pasv(True)
    return ftp


def ensure_remote_dir(ftp: ftplib.FTP, remote_dir: str) -> None:
    """Open remote_dir, creating each missing folder (including /amazon)."""
    parts = [p for p in remote_dir.strip("/").split("/") if p]
    try:
        ftp.cwd("/")
    except ftplib.error_perm:
        pass

    built: list[str] = []
    for part in parts:
        built.append(part)
        try:
            ftp.cwd(part)
            continue
        except ftplib.error_perm:
            pass
        try:
            ftp.mkd(part)
        except ftplib.error_perm as exc:
            try:
                ftp.cwd(part)
                continue
            except ftplib.error_perm:
                folder = "/" + "/".join(built)
                raise SystemExit(f"Could not create remote folder {folder}: {exc}") from exc
        print(f"Created remote folder /{'/'.join(built)}")
        ftp.cwd(part)


def upload_tree(ftp: ftplib.FTP, local_dir: Path, remote_dir: str) -> int:
    ensure_remote_dir(ftp, remote_dir)
    count = 0
    for path in sorted(local_dir.rglob("*")):
        relative = path.relative_to(local_dir).as_posix()
        if path.is_dir():
            ensure_remote_dir(ftp, f"{remote_dir.rstrip('/')}/{relative}")
            continue
        remote_parent = remote_dir.rstrip("/")
        parent = path.parent.relative_to(local_dir).as_posix()
        if parent != ".":
            remote_parent = f"{remote_parent}/{parent}"
        ensure_remote_dir(ftp, remote_parent)
        with path.open("rb") as handle:
            ftp.storbinary(f"STOR {path.name}", handle)
        count += 1
        print(f"  {remote_parent}/{path.name}")
    return count


def backend_root() -> Path:
    configured = os.environ.get("BACKEND_DIR", "../sympleone-backend")
    path = Path(configured)
    if not path.is_absolute():
        path = (ROOT / path).resolve()
    if not (path / "app" / "main.py").is_file():
        raise SystemExit(f"Backend not found at {path}")
    return path


def iter_backend_files(root: Path):
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        relative = path.relative_to(root)
        if any(part in BACKEND_SKIP_DIRS for part in relative.parts):
            continue
        if path.name in BACKEND_SKIP_FILES or path.suffix in {".pyc", ".db"}:
            continue
        yield path


def upload_backend(ftp: ftplib.FTP, remote_dir: str) -> int:
    root = backend_root()
    ensure_remote_dir(ftp, remote_dir)
    count = 0
    for path in sorted(iter_backend_files(root)):
        relative = path.relative_to(root)
        remote_parent = remote_dir.rstrip("/")
        if relative.parent.as_posix() != ".":
            remote_parent = f"{remote_parent}/{relative.parent.as_posix()}"
        ensure_remote_dir(ftp, remote_parent)
        with path.open("rb") as handle:
            ftp.storbinary(f"STOR {path.name}", handle)
        count += 1
        print(f"  {remote_parent}/{path.name}")

    ensure_remote_dir(ftp, remote_dir)
    for name, body in (
        (".htaccess", BACKEND_HTACCESS),
        ("passenger_wsgi.py", PASSENGER_WSGI),
    ):
        from io import BytesIO

        ftp.storbinary(f"STOR {name}", BytesIO(body.encode("utf-8")))
        count += 1
        print(f"  {remote_dir.rstrip('/')}/{name}")
    return count


def main() -> None:
    parser = argparse.ArgumentParser(description="Deploy SympleOne over FTP")
    parser.add_argument("--frontend-only", action="store_true")
    parser.add_argument("--backend-only", action="store_true")
    parser.add_argument("--skip-build", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if args.frontend_only and args.backend_only:
        raise SystemExit("Choose only one of --frontend-only or --backend-only")

    load_env_file(ENV_FILE)
    deploy_frontend = not args.backend_only
    deploy_backend = not args.frontend_only
    base_path = os.environ.get("VITE_BASE_PATH", "/amazon/").strip() or "/amazon/"
    if not base_path.startswith("/"):
        base_path = f"/{base_path}"
    if not base_path.endswith("/"):
        base_path = f"{base_path}/"

    remote_frontend = os.environ.get("FTP_REMOTE_DIR", "/amazon").strip() or "/amazon"
    remote_backend = os.environ.get("FTP_BACKEND_DIR", "/amazon/backend").strip() or "/amazon/backend"

    dist: Path | None = None
    if deploy_frontend and not args.skip_build and not args.dry_run:
        dist = build_frontend(base_path)
    elif deploy_frontend and not args.skip_build and args.dry_run:
        print(f"Dry run: would build frontend with base {base_path}")
        dist = ROOT / "dist"
    elif deploy_frontend:
        dist = ROOT / "dist"
        if not dist.is_dir():
            raise SystemExit("dist/ is missing. Run without --skip-build.")

    if args.dry_run:
        print(f"Dry run: frontend -> {remote_frontend}" if deploy_frontend else "Dry run: skip frontend")
        print(f"Dry run: backend  -> {remote_backend}" if deploy_backend else "Dry run: skip backend")
        print("FTP login was not attempted.")
        return

    ftp = connect()
    try:
        if deploy_frontend and dist is not None:
            print(f"Uploading frontend to {remote_frontend}")
            uploaded = upload_tree(ftp, dist, remote_frontend)
            print(f"Frontend files uploaded: {uploaded}")
        if deploy_backend:
            print(f"Uploading backend to {remote_backend}")
            uploaded = upload_backend(ftp, remote_backend)
            print(f"Backend files uploaded: {uploaded}")
    finally:
        try:
            ftp.quit()
        except ftplib.all_errors:
            ftp.close()

    print("Upload finished.")
    if deploy_backend:
        print(
            "FTP only copies the API. Start it on the host (Passenger/uvicorn) "
            f"with the app root at {remote_backend}, entry passenger_wsgi.py. "
            "Put production secrets in the host environment, not in the upload."
        )


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as exc:
        sys.exit(exc.returncode)
