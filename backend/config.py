"""Configuration for the Plant Shop e-commerce application.

Reads settings from environment variables so the app can run both locally
(using defaults) and on Vercel (using Vercel Environment Variables).
"""
import os

# Load variables from a local .env file (if present) so you can run the app
# locally without exporting variables. On Vercel, the same variables are set
# via Project Settings -> Environment Variables, which override .env.
try:
    from dotenv import load_dotenv

    # .env lives in the project root (one level up from backend/)
    env_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"
    )
    load_dotenv(env_path)
except ImportError:
    pass  # python-dotenv not installed; rely on real environment variables

# --- Default admin credentials (used on first run / seed) ---
# Stored hashed in DB. Default: admin / admin123
DEFAULT_ADMIN_USERNAME = "admin"
DEFAULT_ADMIN_PASSWORD = "admin123"

# --- Server settings ---
HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", 8000))

# --- Static file root (frontend folder) ---
FRONTEND_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend"
)

# --- Database settings (from environment variables) ---
# Supabase (PostgreSQL) connection string. On Vercel, set the SAME variable in
# Settings -> Environment Variables.
#
# Get it from Supabase Dashboard -> Project Settings -> Database:
#   - Direct connection (local dev):   postgresql://postgres.<ref>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres?sslmode=require
#   - Transaction pooler (serverless): postgresql://postgres.<ref>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:6543/postgres?sslmode=require
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres.ahckojeyxfoaakxpqqvm:PlantSHop%40123@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require")