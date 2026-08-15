"""Flask application for the Plant Shop e-commerce application.

Refactored from the original ``http.server`` implementation so the app can be
deployed on Vercel as a serverless WSGI application. The Flask app serves both
the REST API and the static frontend files.

Run locally (optional):
    pip install -r backend/requirements.txt
    python -m flask --app backend.app run
"""
import base64
import hashlib
import os
import sys
import urllib.parse
from datetime import datetime, date
from decimal import Decimal

from flask import Flask, jsonify, request, send_from_directory

_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from database import query, execute
from config import FRONTEND_DIR

app = Flask(__name__, static_folder=None)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def hash_password(password):
    """Return a SHA-256 hex digest of the password."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def _normalize_for_json(value):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: _normalize_for_json(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_normalize_for_json(v) for v in value]
    return value


def _json(data, status=200):
    return jsonify(data), status


def parse_product(data):
    """Validate and normalize product data from a request."""
    name = str(data.get("name", "")).strip()
    category = str(data.get("category", "")).strip()
    plant_type = str(data.get("plant_type", "general")).strip()
    try:
        price = float(data.get("price", 0))
    except (TypeError, ValueError):
        price = 0
    try:
        stock = int(data.get("stock", 0))
    except (TypeError, ValueError):
        stock = 0
    description = str(data.get("description", "")).strip()
    image_url = str(data.get("image_url", "")).strip()

    if not name or not category:
        return None, "Name and category are required"
    if category not in ("indoor", "outdoor"):
        return None, "Category must be indoor or outdoor"
    if price < 0:
        return None, "Price cannot be negative"

    return {
        "name": name,
        "category": category,
        "plant_type": plant_type or "general",
        "price": price,
        "stock": stock,
        "description": description,
        "image_url": image_url,
    }, None


def _check_user():
    """Verify customer credentials from the Authorization header.
    Token format: base64(email:password). Returns user row or None.
    """
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth[7:]
    try:
        decoded = base64.b64decode(token).decode("utf-8")
        email, password = decoded.split(":", 1)
    except Exception:
        return None
    row = query(
        "SELECT id, name, email, phone, password_hash FROM users WHERE email = %s",
        (email,),
        fetchone=True,
    )
    if row and row["password_hash"] == hash_password(password):
        return row
    return None


def _check_admin():
    """Verify admin credentials from the Authorization header."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth[7:]
    try:
        decoded = base64.b64decode(token).decode("utf-8")
        username, password = decoded.split(":", 1)
    except Exception:
        return None
    row = query(
        "SELECT * FROM admin_users WHERE username = %s",
        (username,),
        fetchone=True,
    )
    if row and row["password_hash"] == hash_password(password):
        return row
    return None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

@app.route("/api/products", methods=["GET"])
def handle_products_list():
    """GET /api/products with optional filters:
    search, category, min_price, max_price, plant_type
    """
    conditions = []
    values = []

    search = request.args.get("search")
    if search:
        term = f"%{search}%"
        conditions.append("(name LIKE %s OR plant_type LIKE %s OR description LIKE %s)")
        values.extend([term, term, term])

    category = request.args.get("category")
    if category:
        conditions.append("category = %s")
        values.append(category)

    plant_type = request.args.get("plant_type")
    if plant_type:
        conditions.append("plant_type = %s")
        values.append(plant_type)

    min_price = request.args.get("min_price")
    if min_price:
        conditions.append("price >= %s")
        values.append(float(min_price))

    max_price = request.args.get("max_price")
    if max_price:
        conditions.append("price <= %s")
        values.append(float(max_price))

    where = "WHERE " + " AND ".join(conditions) if conditions else ""
    sql = f"SELECT * FROM products {where} ORDER BY name"
    products = query(sql, values)
    return _json({"products": products})


@app.route("/api/products/<int:pid>", methods=["GET"])
def handle_product_detail(pid):
    product = query("SELECT * FROM products WHERE id = %s", (pid,), fetchone=True)
    if not product:
        return _json({"error": "Product not found"}, 404)
    return _json({"product": product})


@app.route("/api/auth/register", methods=["POST"])
def handle_register():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    phone = str(data.get("phone", "")).strip()
    password = str(data.get("password", "")).strip()

    if not name:
        return _json({"error": "Name is required"}, 400)
    if not email or "@" not in email or "." not in email:
        return _json({"error": "A valid email is required"}, 400)
    if len(password) < 4:
        return _json({"error": "Password must be at least 4 characters"}, 400)

    existing = query("SELECT id FROM users WHERE email = %s", (email,), fetchone=True)
    if existing:
        return _json({"error": "An account with this email already exists"}, 409)

    user_id = execute(
        "INSERT INTO users (name, email, phone, password_hash) VALUES (%s, %s, %s, %s)",
        (name, email, phone, hash_password(password)),
        get_id=True,
    )
    token = base64.b64encode(f"{email}:{password}".encode()).decode()
    return _json({
        "success": True,
        "token": token,
        "user": {"id": user_id, "name": name, "email": email, "phone": phone},
    }, 201)


@app.route("/api/auth/login", methods=["POST"])
def handle_login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", "")).strip()
    row = query(
        "SELECT id, name, email, phone, password_hash FROM users WHERE email = %s",
        (email,),
        fetchone=True,
    )
    if row and row["password_hash"] == hash_password(password):
        token = base64.b64encode(f"{email}:{password}".encode()).decode()
        return _json({
            "success": True,
            "token": token,
            "user": {"id": row["id"], "name": row["name"], "email": row["email"], "phone": row["phone"]},
        })
    return _json({"error": "Invalid email or password"}, 401)


@app.route("/api/auth/me", methods=["GET"])
def handle_auth_me():
    user = _check_user()
    if not user:
        return _json({"error": "Unauthorized"}, 401)
    return _json({"user": {
        "id": user["id"], "name": user["name"], "email": user["email"], "phone": user["phone"],
    }})


@app.route("/api/orders", methods=["GET"])
def handle_my_orders():
    """GET /api/orders - return the authenticated user's orders."""
    user = _check_user()
    if not user:
        return _json({"error": "Unauthorized"}, 401)
    orders = query(
        """SELECT o.*, string_agg(
             concat(oi.quantity, ' x ', p.name), ' | ') AS items
           FROM orders o
           LEFT JOIN order_items oi ON oi.order_id = o.id
           LEFT JOIN products p ON p.id = oi.product_id
           WHERE o.user_id = %s
           GROUP BY o.id
           ORDER BY o.order_date DESC""",
        (user["id"],),
    )
    return _json({"orders": orders})


@app.route("/api/orders", methods=["POST"])
def handle_create_order():
    # Require login to place an order
    user = _check_user()
    if not user:
        return _json({"error": "Please log in to place an order"}, 401)

    data = request.get_json(silent=True) or {}
    name = str(data.get("customer_name", "")).strip() or user["name"]
    phone = str(data.get("customer_phone", "")).strip() or (user["phone"] or "")
    email = str(data.get("customer_email", "")).strip() or user["email"]
    address = str(data.get("address", "")).strip()
    payment_method = str(data.get("payment_method", "")).strip()
    items = data.get("items", [])

    if not name:
        return _json({"error": "Customer name is required"}, 400)
    if not items:
        return _json({"error": "Cart is empty"}, 400)
    if payment_method not in ("cash", "upi", "card"):
        return _json({"error": "Invalid payment method"}, 400)

    # Validate stock and compute total
    total = Decimal("0.00")
    order_items_data = []
    try:
        for it in items:
            pid = it.get("product_id")
            qty = int(it.get("quantity", 1))
            product = query("SELECT * FROM products WHERE id = %s", (pid,), fetchone=True)
            if not product:
                return _json({"error": f"Product {pid} not found"}, 400)
            if qty < 1 or qty > product["stock"]:
                return _json({"error": f"Insufficient stock for {product['name']}"}, 400)
            line_total = product["price"] * qty
            total += line_total
            order_items_data.append((pid, qty, product["price"]))

        # Insert order (order_status defaults to 'pending')
        order_id = execute(
            """INSERT INTO orders
               (user_id, customer_name, customer_phone, customer_email, address,
                total_amount, payment_method, payment_status, order_status)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (user["id"], name, phone, email, address, total, payment_method, "pending", "pending"),
            get_id=True,
        )

        # Insert order items and decrement stock
        for pid, qty, price in order_items_data:
            execute(
                "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (%s, %s, %s, %s)",
                (order_id, pid, qty, price),
            )
            execute("UPDATE products SET stock = stock - %s WHERE id = %s", (qty, pid))

        return _json({"success": True, "order_id": order_id, "total_amount": float(total)}, 201)
    except Exception as e:
        return _json({"error": str(e)}, 500)


# ---------------------------------------------------------------------------
# Admin API
# ---------------------------------------------------------------------------

@app.route("/api/admin/login", methods=["POST"])
def handle_admin_login():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", "")).strip()
    row = query(
        "SELECT id, username, password_hash FROM admin_users WHERE username = %s",
        (username,),
        fetchone=True,
    )
    if row and row["password_hash"] == hash_password(password):
        token = base64.b64encode(f"{username}:{password}".encode()).decode()
        return _json({"success": True, "token": token, "username": row["username"]})
    return _json({"error": "Invalid credentials"}, 401)


@app.route("/api/admin/products", methods=["GET"])
def handle_admin_products_list():
    if not _check_admin():
        return _json({"error": "Unauthorized"}, 401)
    products = query("SELECT * FROM products ORDER BY id DESC")
    return _json({"products": products})


@app.route("/api/admin/products", methods=["POST"])
def handle_admin_add_product():
    if not _check_admin():
        return _json({"error": "Unauthorized"}, 401)
    data = request.get_json(silent=True) or {}
    product, err = parse_product(data)
    if err:
        return _json({"error": err}, 400)
    pid = execute(
        """INSERT INTO products
           (name, category, plant_type, price, description, image_url, stock)
           VALUES (%s, %s, %s, %s, %s, %s, %s)""",
        (product["name"], product["category"], product["plant_type"],
         product["price"], product["description"], product["image_url"], product["stock"]),
        get_id=True,
    )
    return _json({"success": True, "id": pid}, 201)


@app.route("/api/admin/products/<int:pid>", methods=["PUT"])
def handle_admin_update_product(pid):
    if not _check_admin():
        return _json({"error": "Unauthorized"}, 401)
    existing = query("SELECT * FROM products WHERE id = %s", (pid,), fetchone=True)
    if not existing:
        return _json({"error": "Product not found"}, 404)
    data = request.get_json(silent=True) or {}
    product, err = parse_product(data)
    if err:
        return _json({"error": err}, 400)
    execute(
        """UPDATE products SET name=%s, category=%s, plant_type=%s, price=%s,
           description=%s, image_url=%s, stock=%s WHERE id=%s""",
        (product["name"], product["category"], product["plant_type"],
         product["price"], product["description"], product["image_url"],
         product["stock"], pid),
    )
    return _json({"success": True, "id": pid})


@app.route("/api/admin/products/<int:pid>", methods=["DELETE"])
def handle_admin_delete_product(pid):
    if not _check_admin():
        return _json({"error": "Unauthorized"}, 401)
    try:
        # Remove order_items rows referencing this product first. The FK has no
        # ON DELETE CASCADE, so a product in any past order could not be deleted.
        execute("DELETE FROM order_items WHERE product_id = %s", (pid,))
        rowcount = execute("DELETE FROM products WHERE id = %s", (pid,))
    except Exception as e:
        return _json({"error": f"Could not delete product: {e}"}, 500)
    if rowcount == 0:
        return _json({"error": "Product not found"}, 404)
    return _json({"success": True, "id": pid})


@app.route("/api/admin/orders", methods=["GET"])
def handle_admin_orders():
    if not _check_admin():
        return _json({"error": "Unauthorized"}, 401)
    orders = query(
        """SELECT o.*, string_agg(
             concat(oi.quantity, ' x ', p.name), ' | ') AS items
           FROM orders o
           LEFT JOIN order_items oi ON oi.order_id = o.id
           LEFT JOIN products p ON p.id = oi.product_id
           GROUP BY o.id
           ORDER BY o.order_date DESC"""
    )
    return _json({"orders": orders})


@app.route("/api/admin/orders/<int:oid>", methods=["PUT"])
def handle_admin_update_order(oid):
    """PUT /api/admin/orders/<id> with {"order_status": "..."}."""
    if not _check_admin():
        return _json({"error": "Unauthorized"}, 401)
    existing = query("SELECT id FROM orders WHERE id = %s", (oid,), fetchone=True)
    if not existing:
        return _json({"error": "Order not found"}, 404)
    data = request.get_json(silent=True) or {}
    order_status = str(data.get("order_status", "")).strip()
    valid_statuses = ("pending", "processing", "shipped", "delivered", "cancelled")
    if order_status not in valid_statuses:
        return _json({"error": "Invalid order status"}, 400)
    execute(
        "UPDATE orders SET order_status = %s WHERE id = %s",
        (order_status, oid),
    )
    return _json({"success": True, "id": oid, "order_status": order_status})


# ---------------------------------------------------------------------------
# Static file serving (frontend)
# ---------------------------------------------------------------------------

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_static(path):
    if path in ("", "index.html"):
        path = "index.html"
    full = os.path.normpath(os.path.join(FRONTEND_DIR, path))
    if not full.startswith(os.path.normpath(FRONTEND_DIR)):
        return "Forbidden", 403
    if not os.path.isfile(full):
        return "Not Found", 404
    return send_from_directory(FRONTEND_DIR, os.path.relpath(full, FRONTEND_DIR).replace(os.sep, "/"))


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
