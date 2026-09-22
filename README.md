# SympleOne

Read-only React SPA with Redux, centralized API configuration, and Docker deployment on [Render](https://render.com).

## Stack

- React 19 + TypeScript + Vite
- Redux Toolkit (`src/features/*`)
- React Router
- nginx (production static hosting)

## API configuration (single place)

All base URLs and endpoint paths are defined in **`src/config/api.config.ts`**.

- Override the API origin with `VITE_API_BASE_URL` (build-time env).
- Use endpoint keys in the HTTP client (e.g. `auth.login` → `POST` to configured path).
- Add new read endpoints under `API_CONFIG.endpoints` only; do not hardcode URLs in features.

## Auth module

- Login UI: `src/features/auth/LoginPage.tsx`
- Redux slice + thunks: `src/features/auth/authSlice.ts`
- API calls: `src/features/auth/authApi.ts` (uses shared `apiRequest`)

Expected login response shape:

```json
{
  "accessToken": "…",
  "user": { "id": "…", "email": "…", "name": "…" }
}
```

Adjust mapping in `authApi.ts` if your backend differs.

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Docker

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://your-api.example.com/api \
  -t sympleone .
docker run -p 8080:80 sympleone
```

## Render

1. Create a **Web Service** → **Docker**.
2. Connect this repository.
3. Set build-time variable `VITE_API_BASE_URL` to your API URL (Render passes it into the Docker build).
4. Deploy. Optional: import `render.yaml` as a Blueprint.

## Scripts

| Command        | Description        |
|----------------|--------------------|
| `npm run dev`  | Vite dev server    |
| `npm run build`| Production build   |
| `npm run preview` | Preview build   |
