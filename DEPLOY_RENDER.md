# Deploy SympleOne on Render (free tier)

You need **two GitHub repositories** (frontend + backend) and **two Render Web Services**.

> **Free tier notes:** Services spin down after inactivity (~50s cold start). SQLite on the API uses `/tmp` and is **reset on redeploy** — fine for demos; use Render Postgres for production data.

## 1. Push code to GitHub

If you have not already:

```bash
# Backend
cd sympleone-backend
git init
git add .
git commit -m "Prepare Render deployment"
# Create empty repo on GitHub, then:
git remote add origin https://github.com/YOUR_USER/sympleone-backend.git
git push -u origin main

# Frontend
cd ../sympleone
git add .
git commit -m "Prepare Render deployment"
git remote add origin https://github.com/YOUR_USER/sympleone.git
git push -u origin main
```

## 2. Deploy the API first

1. [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**.
2. Connect the **`sympleone-backend`** repo.
3. Render reads `render.yaml` and creates **sympleone-api**.
4. When prompted, set **sync: false** secrets:
   - `SYMPLEONE_ADMIN_PASSWORD` — strong password for `admin@sympleone.com`
   - `AMAZON_APP_ID`, `AMAZON_REDIRECT_URI`, etc. (if using Amazon connect)
5. Wait until deploy is **Live**. Copy the URL, e.g. `https://sympleone-api.onrender.com`.
6. Verify: `https://sympleone-api.onrender.com/health` → `{"status":"ok",...}`

**Amazon OAuth on Render:** set  
`AMAZON_REDIRECT_URI=https://sympleone-api.onrender.com/api/amazon/oauth/callback`  
(and register that URL in Seller Central when the callback is implemented).

## 3. Deploy the frontend

1. **New** → **Blueprint** → connect **`sympleone`** repo.
2. Set environment variable for the Docker build:
   - `VITE_API_BASE_URL` = `https://sympleone-api.onrender.com/api`  
     (your real API host from step 2, **no trailing slash**)
   - `VITE_AUTH_RELAXED` = `false`
3. Deploy. Open `https://sympleone.onrender.com` (or your service name).
4. Log in with `admin@sympleone.com` and the password you set on the API service.

## 4. CORS

The API already allows all origins (`*`). No extra CORS setup is required for Render URLs.

## 5. Updating after code changes

Push to GitHub; Render auto-redeploys if auto-deploy is enabled.

**Important:** Changing `VITE_API_BASE_URL` requires a **new frontend build** (redeploy the static site service).

## Troubleshooting

| Issue | Fix |
|--------|-----|
| Login fails / network error | Check `VITE_API_BASE_URL` matches API URL + `/api` |
| 503 on Amazon Authorize | Set `AMAZON_APP_ID` and `AMAZON_REDIRECT_URI` on API service |
| API 502 on wake | Wait for cold start; check logs in Render |
| Data gone after redeploy | Expected on free SQLite; add Postgres later |
