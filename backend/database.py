"""Database connection and query helpers for the Plant Shop application.

Uses psycopg2 against Supabase (PostgreSQL) with parameterized queries to
prevent SQL injection. Connect via the ``DATABASE_URL`` connection string
(see ``config.py`` / ``.env.example``).
"""
import psycopg2
import psycopg2.extras
from psycopg2 import pool as psycopg_pool

from config import DATABASE_URL

# Lazy-created connection pool to reuse connections across requests.
_pool = None


def get_pool():
    """Lazily create and return the global connection pool."""
    global _pool
    if _pool is None:
        if not DATABASE_URL:
            raise RuntimeError(
                "DATABASE_URL is not set. Copy .env.example to .env and fill in "
                "your Supabase connection string."
            )
        _pool = psycopg_pool.ThreadedConnectionPool(1, 5, DATABASE_URL)
    return _pool


def get_connection():
    """Return a single connection from the pool."""
    try:
        return get_pool().getconn()
    except Exception as err:
        raise RuntimeError(f"Database connection failed: {err}")


def query(sql, params=None, fetchone=False):
    """Run a SELECT query and return a list of dicts (or a single dict)."""
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params or ())
            if fetchone:
                result = cur.fetchone()
            else:
                result = cur.fetchall()
            if result is None:
                return None
            return dict(result) if fetchone else [dict(r) for r in result]
    finally:
        get_pool().putconn(conn)


def execute(sql, params=None, get_id=False):
    """Run an INSERT/UPDATE/DELETE query.

    Returns rowcount, or the last insert id when ``get_id`` is True
    (implemented with ``RETURNING id`` since psycopg2 has no ``lastrowid``).
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            if get_id:
                sql = sql.rstrip().rstrip(";") + " RETURNING id"
                cur.execute(sql, params or ())
                row = cur.fetchone()
                result = row[0] if row else None
            else:
                cur.execute(sql, params or ())
                result = cur.rowcount
        conn.commit()
        return result
    except Exception:
        conn.rollback()
        raise
    finally:
        get_pool().putconn(conn)
