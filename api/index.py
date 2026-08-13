"""Vercel serverless entry point for the Plant Shop Flask app.

Vercel detects a WSGI ``app`` object in a Python function file under ``api/``.
This module imports the Flask application from ``backend.app`` and exposes it
as ``app`` so Vercel can route requests to it.
"""
import os
import sys

# Ensure the backend directory is importable (it contains app.py, config.py,
# database.py). Vercel runs functions from the project root, so we add the
# backend folder to sys.path.
_BACKEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

# Werkzeug (used by Flask) needs a writable temp dir; Vercel provides /tmp.
os.environ.setdefault("TMPDIR", "/tmp")

from backend.app import app  # noqa: E402

# Vercel WSGI convention: expose the callable as `app`.
app = app
