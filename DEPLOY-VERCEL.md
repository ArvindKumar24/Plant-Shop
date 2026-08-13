# Deploying GreenLeaf Plants to Vercel

This guide explains how to deploy the GreenLeaf Plants storefront to **Vercel** using a **Flask serverless function** for the API and **Supabase (PostgreSQL)** as the database.

> For full end-to-end setup (Supabase project, schema import, local run, deploy), see **`SETUP-SUPABASE-VERCEL.txt`** first.

---

## Overview

| Component | How it's served |
|-----------|------------------|
| Frontend (`frontend/`) | Served as static files (Vercel `outputDirectory`) |
| API (`/api/...`) | Flask app (`backend/app.py`) via serverless function (`api/index.py`) |
| Database | Supabase PostgreSQL (Vercel has **no** persistent DB) |

---

## 1. Prerequisites

- [GitHub](https://github.com) account
- [Vercel](https://vercel.com) account
- A **Supabase** project with the schema imported (see `SETUP-SUPABASE-VERCEL.txt`, Parts 1 & 3)

---

## 2. Configure environment variables

### Locally
Copy the template and fill it in:
```bash
copy .env.example .env
# macOS/Linux: cp .env.example .env
```
```
DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require
```

### On Vercel
In your Vercel project → **Settings → Environment Variables**, add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Supabase **transaction pooler** connection string (port `6543`), ending in `?sslmode=require` |

Use the **transaction pooler** (not the direct connection) so serverless functions can open short-lived connections.

Click **Save** after adding them.

> **Security:** `.env` is gitignored (never commit real credentials). The `.env.example` file is the template.

---

## 3. Deploy

### Via GitHub (recommended)
1. Push this repo to GitHub (make sure `.env` is **not** committed):
   ```bash
   git add .
   git commit -m "Add Vercel deployment"
   git push origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Set **Framework Preset** to **Other** (the `vercel.json` handles build/output).
4. Add the `DATABASE_URL` environment variable from step 2.
5. Click **Deploy**.

### Via CLI
```bash
npm install -g vercel
vercel
vercel --prod
```

---

## 4. Verify

After deployment, confirm:

- ✅ Storefront loads: `https://<your-app>.vercel.app`
- ✅ API responds: `https://<your-app>.vercel.app/api/products`
- ✅ Registration / Login works
- ✅ Product browsing, cart, checkout work
- ✅ Admin panel: `https://<your-app>.vercel.app/admin.html` (admin / admin123)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Database connection failed` | Check `DATABASE_URL`; URL-encode the password (no raw `@ : / %`) |
| `SSL error` | Keep `?sslmode=require` at the end of `DATABASE_URL` |
| 404 on API | Ensure `api/index.py` is committed and `rewrites` in `vercel.json` are intact |
| No products | Run `database/schema.sql` in the Supabase SQL Editor |
| Functions timeout | Use the **transaction pooler** connection string (port `6543`) |

---

## Notes

- The original `backend/server.py` (pure `http.server`) is kept for **local development only**. Production uses `backend/app.py` (Flask).
- Vercel Hobby functions have ~10s execution limits; the transaction pooler keeps connection overhead low. Fine for demos.
