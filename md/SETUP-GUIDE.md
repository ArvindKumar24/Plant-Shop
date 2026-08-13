# 🌿 GreenLeaf Plants — Complete Setup & Run Guide

A single, step-by-step guide to set up the **GreenLeaf Plants** e-commerce project on a **new system** and run it for the first time.

> ✅ Works on **Windows 11**, **macOS**, and **Linux**. Windows commands are shown first; macOS/Linux equivalents are included where they differ.
>
> For the **Supabase + Vercel** end-to-end setup, see **`SETUP-SUPABASE-VERCEL.txt`** in the project root.

---

## 1. Project Overview

| Item | Detail |
|------|--------|
| **Project** | GreenLeaf Plants — e-commerce website for buying indoor & outdoor plants |
| **Backend** | Flask (Python) |
| **Database** | Supabase — PostgreSQL (`psycopg2` via `DATABASE_URL`) |
| **Frontend** | HTML, CSS, JavaScript (no build step / no Node.js needed) |
| **Server URL** | `http://127.0.0.1:5000` |
| **Default Admin** | Username: `admin` / Password: `admin123` |

### What's inside the project

```
project/
├── database/
│   └── schema.sql          # PostgreSQL schema + seed data (run in Supabase SQL Editor)
├── backend/
│   ├── config.py           # Configuration (DATABASE_URL, server, frontend dir)
│   ├── database.py         # psycopg2 connection pool + query helpers (Supabase)
│   ├── app.py              # Flask app + REST API (primary entry point)
│   ├── server.py           # Legacy http.server version (local use only)
│   └── requirements.txt    # Python dependencies
└── frontend/               # Static HTML/CSS/JS (served by the backend)
```

---

## 2. Prerequisites — What to Install on a New System

### 2.1 Python 3.9+
- **Check if already installed:** open a terminal and run:
  ```bash
  python --version
  ```
  (On macOS/Linux: `python3 --version`)
- If not installed, download from <https://www.python.org/downloads/>
- **Windows tip:** during installation, **check** the box **"Add Python to PATH"**.

### 2.2 A Supabase account (free)
- Sign up at <https://supabase.com>. You will create the database there — **no local database install needed**.

> Everything else (backend libraries, database, frontend) is handled automatically in the steps below — no Node.js, no npm, no MySQL, no build tools required.

---

## 3. Copy the Project to the New System

1. Copy the entire project folder (containing `backend/`, `database/`, `frontend/`, `README.md`) to your new system.
2. Open a terminal in the project root folder (the folder that contains `backend/`).

> **Verify:** run `ls` (macOS/Linux) or `dir` (Windows) — you should see `backend`, `database`, and `frontend` folders.

---

## 4. Step-by-Step Setup

### Step 1 — Set up the Supabase database

**1a. Create a project** at <https://supabase.com>:
- Click **New project** → name it (e.g. `plant-shop`) → set a **database password** (save it!) → choose a region → **Create project**.

**1b. Import the schema** (creates the tables, the default admin user, and 12 sample products):
- In the Supabase Dashboard, open **SQL Editor** → **New query**.
- Paste the **entire contents of `database/schema.sql`** and click **Run**.

**1c. Verify the import:**
- Open **Table Editor** → `products` should show **12 rows**.
- `admin_users` should show **1 row** (username `admin`).

> ⚠️ Re-running the schema is safe — it drops and recreates all tables, resetting data to the seed defaults.

### Step 2 — Configure the Backend (connection string)

Copy the example env file and fill in your Supabase connection string:

- **Windows:**
  ```bash
  copy .env.example .env
  ```
- **macOS / Linux:**
  ```bash
  cp .env.example .env
  ```

In Supabase: **Project Settings → Database → Connection string** → copy the **URI**. Use the **direct connection (port 5432)** for local development. Open `.env` and set:

```
DATABASE_URL=postgresql://postgres.<ref>:<PASSWORD>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
```

> If the password contains URL-unsafe characters (`@`, `:`, `/`, `%`), reset it in **Project Settings → Database** to a URL-safe value.

### Step 3 — Create a Python Virtual Environment (recommended)

This isolates the project's Python dependencies from your system.

- **Windows:**
  ```bash
  cd backend
  python -m venv venv
  venv\Scripts\activate
  ```
- **macOS / Linux:**
  ```bash
  cd backend
  python3 -m venv venv
  source venv/bin/activate
  ```

You should now see `(venv)` at the start of your terminal prompt — that means the environment is active.

### Step 4 — Install Python Dependencies

While the virtual environment is active, run:

```bash
pip install -r requirements.txt
```

This installs `flask`, `psycopg2-binary`, and `python-dotenv`.

### Step 5 — Run the Server

Make sure you are in the `backend` folder (and the venv is active), then run:

```bash
python -m flask --app app run
```

You should see:

```
* Running on http://127.0.0.1:5000
```

> Keep this terminal window open — the server must stay running while you use the website.

---

## 5. Opening & Testing the Website

1. Open your browser and go to: **<http://127.0.0.1:5000>**
2. You should see the **GreenLeaf Plants** home page with the sample products.

### Quick test checklist

| Action | How |
|--------|-----|
| Browse products | Home page, or **Products** page — try search / filters |
| Register a customer | Click **Login** → **Register** (name, email, password) |
| Place an order | Add a plant to cart → **Checkout** → choose payment (Cash / UPI / Card) |
| Track order status | Logged in → click **My Orders** |
| Admin login | Go to **http://127.0.0.1:5000/admin.html** → `admin` / `admin123` |
| Admin: manage products | Admin dashboard → **Products** tab → add / edit / delete |
| Admin: update order status | Admin dashboard → **Orders** tab → change status dropdown (pending → processing → shipped → delivered / cancelled) |
| Admin: configure UPI QR | Admin dashboard → **Payment Settings** tab |

---

## 6. Default Credentials

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin123` |
| **Customer** | Create your own via the **Register** page | — |

---

## 7. Shutting Down / Restarting

- **Stop the server:** press `Ctrl + C` in the server terminal.
- **Restart the server:** in the `backend` folder with the venv active, run `python -m flask --app app run` again.
- **Deactivate the venv (optional):** run `deactivate` (Windows and macOS/Linux).

---

## 8. Quick-Start Summary (Copy-Paste for a New System)

```bash
# 1. In Supabase (https://supabase.com):
#    a. Create a project
#    b. Run database/schema.sql in the SQL Editor

# 2. Configure the connection string
copy .env.example .env        # Windows
cp .env.example .env          # macOS/Linux
# ...then edit .env and set DATABASE_URL

# 3. Set up and activate the virtual environment
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run the server
python -m flask --app app run

# 6. Open http://127.0.0.1:5000 in your browser
```

---

## 9. Troubleshooting

| Problem | Likely Cause | Fix |
|---------|--------------|-----|
| `DATABASE_URL is not set` | No `.env` file | `copy .env.example .env`, then fill in `DATABASE_URL` |
| `Database connection failed` | Wrong connection string / password | Double-check `DATABASE_URL`; URL-encode the password (no raw `@ : / %`) |
| `SSL error` | `sslmode` missing | Keep `?sslmode=require` at the end of `DATABASE_URL` |
| `ModuleNotFoundError: No module named 'psycopg2'` | Dependencies not installed / venv not active | Activate venv, then `pip install -r requirements.txt` |
| `Address already in use` / port 5000 busy | Another process is using port 5000 | Run `python -m flask --app app run --port 8000` |
| Server starts but page won't load | Server stopped or wrong URL | Confirm the terminal shows "Running on" and use that exact URL |
| `(venv)` missing from prompt | Venv not activated | Activate it (Step 3) before installing/running |
| Can't log in as admin | Wrong credentials or DB not seeded | Use `admin` / `admin123`; if still failing, re-run `database/schema.sql` |
| No products shown | Schema not run | Run `database/schema.sql` in the Supabase SQL Editor |

---

## 10. Useful API Endpoints (Reference)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (filters: `search`, `category`, `plant_type`, `min_price`, `max_price`) |
| GET | `/api/products/:id` | Product detail |
| POST | `/api/auth/register` | Register a customer |
| POST | `/api/auth/login` | Customer login → token |
| GET | `/api/auth/me` | Current user (requires token) |
| POST | `/api/orders` | Create order (requires login) |
| GET | `/api/orders` | Current user's orders (requires login) |
| POST | `/api/admin/login` | Admin login → token |
| GET/POST | `/api/admin/products` | List / add products (admin) |
| PUT/DELETE | `/api/admin/products/:id` | Update / delete product (admin) |
| GET | `/api/admin/orders` | List all orders (admin) |
| PUT | `/api/admin/orders/:id` | Update order status (admin) |

---

*Generated guide for the GreenLeaf Plants project — designed to get the project running on any new machine in under 10 minutes.*
