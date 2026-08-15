"""Pure Python HTTP server for the Plant Shop e-commerce application.

Serves static frontend files and provides REST API endpoints.
No framework used - built on http.server.

Run:
    python server.py
Then open http://127.0.0.1:8000
"""
import json
import hashlib
import os
import re
import sys
import urllib.parse
from datetime import datetime, date
from decimal import Decimal
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from config import HOST, PORT, FRONTEND_DIR
from database import query, execute

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


def send_json(handler, data, status=200):
    body = json.dumps(_normalize_for_json(data)).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.end_headers()
    handler.wfile.write(body)


def send_text(handler, text, status=200, content_type="text/plain; charset=utf-8"):
    body = text.encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", content_type)
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def read_json_body(handler):
    """Read and parse the JSON request body."""
    length = int(handler.headers.get("Content-Length", 0))
    raw = handler.rfile.read(length) if length else b"{}"
    try:
        return json.loads(raw.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return {}


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


# ---------------------------------------------------------------------------
# Request Handler
# ---------------------------------------------------------------------------

class PlantHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Keep logs concise
        pass

    def _json(self, data, status=200):
        send_json(self, data, status)

    # --- CORS ---
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    # --- Static file serving ---
    def _serve_static(self, path):
        # Map / to index.html
        if path in ("/", "/index.html"):
            path = "/index.html"
        # Prevent path traversal
        full = os.path.normpath(os.path.join(FRONTEND_DIR, path.lstrip("/")))
        if not full.startswith(os.path.normpath(FRONTEND_DIR)):
            self.send_error(403)
            return
        if not os.path.isfile(full):
            self.send_error(404)
            return

        ext = os.path.splitext(full)[1].lower()
        content_types = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
            ".ico": "image/x-icon",
        }
        ctype = content_types.get(ext, "application/octet-stream")
        with open(full, "rb") as f:
            body = f.read()
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    # --- Routing ---
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query_string = urllib.parse.parse_qs(parsed.query)

        # Public API
        if path == "/api/products":
            self.handle_products_list(query_string)
        elif re.fullmatch(r"/api/products/\d+", path):
            pid = int(path.rsplit("/", 1)[1])
            self.handle_product_detail(pid)
        elif path == "/api/auth/me":
            self.handle_auth_me()
        elif path == "/api/orders":
            self.handle_my_orders()
        elif path == "/api/admin/login":
            self.send_error(405)  # must be POST
        elif path == "/api/admin/orders":
            self.handle_admin_orders()
        elif path.startswith("/api/admin/products"):
            self.handle_admin_products_list()
        elif path.startswith("/api/"):
            self._json({"error": "Not found"}, 404)
        else:
            self._serve_static(path)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/orders":
            self.handle_create_order()
        elif path == "/api/auth/register":
            self.handle_register()
        elif path == "/api/auth/login":
            self.handle_login()
        elif path == "/api/admin/login":
            self.handle_admin_login()
        elif path == "/api/admin/products":
            self.handle_admin_add_product()
        else:
            self._json({"error": "Not found"}, 404)

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if re.fullmatch(r"/api/admin/products/\d+", path):
            pid = int(path.rsplit("/", 1)[1])
            self.handle_admin_update_product(pid)
        elif re.fullmatch(r"/api/admin/orders/\d+", path):
            oid = int(path.rsplit("/", 1)[1])
            self.handle_admin_update_order(oid)
        else:
            self._json({"error": "Not found"}, 404)

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if re.fullmatch(r"/api/admin/products/\d+", path):
            pid = int(path.rsplit("/", 1)[1])
            self.handle_admin_delete_product(pid)
        else:
            self._json({"error": "Not found"}, 404)

    # ------------------------------------------------------------------
    # Public API handlers
    # ------------------------------------------------------------------

    def handle_products_list(self, params):
        """GET /api/products with optional filters:
        search, category, min_price, max_price, plant_type
        """
        conditions = []
        values = []

        if params.get("search"):
            term = f"%{params['search'][0]}%"
            conditions.append("(name LIKE %s OR plant_type LIKE %s OR description LIKE %s)")
            values.extend([term, term, term])

        if params.get("category"):
            conditions.append("category = %s")
            values.append(params["category"][0])

        if params.get("plant_type"):
            conditions.append("plant_type = %s")
            values.append(params["plant_type"][0])

        if params.get("min_price"):
            conditions.append("price >= %s")
            values.append(float(params["min_price"][0]))

        if params.get("max_price"):
            conditions.append("price <= %s")
            values.append(float(params["max_price"][0]))

        where = "WHERE " + " AND ".join(conditions) if conditions else ""
        sql = f"SELECT * FROM products {where} ORDER BY name"
        products = query(sql, values)
        self._json({"products": products})

    def handle_product_detail(self, pid):
        product = query("SELECT * FROM products WHERE id = %s", (pid,), fetchone=True)
        if not product:
            self._json({"error": "Product not found"}, 404)
            return
        self._json({"product": product})

    # --- Auth handlers ---
    def _check_user(self):
        """Verify customer credentials from the Authorization header.
        Token format: base64(email:password). Returns user row or None.
        """
        auth = self.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return None
        token = auth[7:]
        try:
            import base64
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

    def handle_register(self):
        data = read_json_body(self)
        name = str(data.get("name", "")).strip()
        email = str(data.get("email", "")).strip().lower()
        phone = str(data.get("phone", "")).strip()
        password = str(data.get("password", "")).strip()

        if not name:
            self._json({"error": "Name is required"}, 400)
            return
        if not email or "@" not in email or "." not in email:
            self._json({"error": "A valid email is required"}, 400)
            return
        if len(password) < 4:
            self._json({"error": "Password must be at least 4 characters"}, 400)
            return

        existing = query("SELECT id FROM users WHERE email = %s", (email,), fetchone=True)
        if existing:
            self._json({"error": "An account with this email already exists"}, 409)
            return

        user_id = execute(
            "INSERT INTO users (name, email, phone, password_hash) VALUES (%s, %s, %s, %s)",
            (name, email, phone, hash_password(password)),
            get_id=True,
        )
        import base64
        token = base64.b64encode(f"{email}:{password}".encode()).decode()
        self._json({
            "success": True,
            "token": token,
            "user": {"id": user_id, "name": name, "email": email, "phone": phone},
        }, 201)

    def handle_login(self):
        data = read_json_body(self)
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", "")).strip()
        row = query(
            "SELECT id, name, email, phone, password_hash FROM users WHERE email = %s",
            (email,),
            fetchone=True,
        )
        if row and row["password_hash"] == hash_password(password):
            import base64
            token = base64.b64encode(f"{email}:{password}".encode()).decode()
            self._json({
                "success": True,
                "token": token,
                "user": {"id": row["id"], "name": row["name"], "email": row["email"], "phone": row["phone"]},
            })
        else:
            self._json({"error": "Invalid email or password"}, 401)

    def handle_auth_me(self):
        user = self._check_user()
        if not user:
            self._json({"error": "Unauthorized"}, 401)
            return
        self._json({"user": {
            "id": user["id"], "name": user["name"], "email": user["email"], "phone": user["phone"],
        }})

    def handle_my_orders(self):
        """GET /api/orders - return the authenticated user's orders."""
        user = self._check_user()
        if not user:
            self._json({"error": "Unauthorized"}, 401)
            return
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
        self._json({"orders": orders})

    def handle_create_order(self):
        # Require login to place an order
        user = self._check_user()
        if not user:
            self._json({"error": "Please log in to place an order"}, 401)
            return

        data = read_json_body(self)
        name = str(data.get("customer_name", "")).strip() or user["name"]
        phone = str(data.get("customer_phone", "")).strip() or (user["phone"] or "")
        email = str(data.get("customer_email", "")).strip() or user["email"]
        address = str(data.get("address", "")).strip()
        payment_method = str(data.get("payment_method", "")).strip()
        items = data.get("items", [])

        if not name:
            self._json({"error": "Customer name is required"}, 400)
            return
        if not items:
            self._json({"error": "Cart is empty"}, 400)
            return
        if payment_method not in ("cash", "upi", "card"):
            self._json({"error": "Invalid payment method"}, 400)
            return

        # Validate stock and compute total
        total = Decimal("0.00")
        order_items_data = []
        try:
            for it in items:
                pid = it.get("product_id")
                qty = int(it.get("quantity", 1))
                product = query("SELECT * FROM products WHERE id = %s", (pid,), fetchone=True)
                if not product:
                    self._json({"error": f"Product {pid} not found"}, 400)
                    return
                if qty < 1 or qty > product["stock"]:
                    self._json({"error": f"Insufficient stock for {product['name']}"}, 400)
                    return
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

            self._json({"success": True, "order_id": order_id, "total_amount": total}, 201)
        except Exception as e:
            self._json({"error": str(e)}, 500)

    # ------------------------------------------------------------------
    # Admin API handlers
    # ------------------------------------------------------------------

    def _check_admin(self):
        """Verify admin credentials from the Authorization header."""
        auth = self.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return None
        token = auth[7:]
        # token = base64(username:password)
        try:
            import base64
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

    def handle_admin_login(self):
        data = read_json_body(self)
        username = str(data.get("username", "")).strip()
        password = str(data.get("password", "")).strip()
        row = query(
            "SELECT id, username, password_hash FROM admin_users WHERE username = %s",
            (username,),
            fetchone=True,
        )
        if row and row["password_hash"] == hash_password(password):
            import base64
            token = base64.b64encode(f"{username}:{password}".encode()).decode()
            self._json({"success": True, "token": token, "username": row["username"]})
        else:
            self._json({"error": "Invalid credentials"}, 401)

    def handle_admin_products_list(self):
        if not self._check_admin():
            self._json({"error": "Unauthorized"}, 401)
            return
        products = query("SELECT * FROM products ORDER BY id DESC")
        self._json({"products": products})

    def handle_admin_add_product(self):
        if not self._check_admin():
            self._json({"error": "Unauthorized"}, 401)
            return
        data = read_json_body(self)
        product, err = parse_product(data)
        if err:
            self._json({"error": err}, 400)
            return
        pid = execute(
            """INSERT INTO products
               (name, category, plant_type, price, description, image_url, stock)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (product["name"], product["category"], product["plant_type"],
             product["price"], product["description"], product["image_url"], product["stock"]),
            get_id=True,
        )
        self._json({"success": True, "id": pid}, 201)

    def handle_admin_update_product(self, pid):
        if not self._check_admin():
            self._json({"error": "Unauthorized"}, 401)
            return
        existing = query("SELECT * FROM products WHERE id = %s", (pid,), fetchone=True)
        if not existing:
            self._json({"error": "Product not found"}, 404)
            return
        data = read_json_body(self)
        product, err = parse_product(data)
        if err:
            self._json({"error": err}, 400)
            return
        execute(
            """UPDATE products SET name=%s, category=%s, plant_type=%s, price=%s,
               description=%s, image_url=%s, stock=%s WHERE id=%s""",
            (product["name"], product["category"], product["plant_type"],
             product["price"], product["description"], product["image_url"],
             product["stock"], pid),
        )
        self._json({"success": True, "id": pid})

    def handle_admin_delete_product(self, pid):
        if not self._check_admin():
            self._json({"error": "Unauthorized"}, 401)
            return
        try:
            # Remove order_items rows referencing this product first. The FK has
            # no ON DELETE CASCADE, so a product in any past order could not be deleted.
            execute("DELETE FROM order_items WHERE product_id = %s", (pid,))
            rowcount = execute("DELETE FROM products WHERE id = %s", (pid,))
        except Exception as e:
            self._json({"error": f"Could not delete product: {e}"}, 500)
            return
        if rowcount == 0:
            self._json({"error": "Product not found"}, 404)
            return
        self._json({"success": True, "id": pid})

    def handle_admin_orders(self):
        if not self._check_admin():
            self._json({"error": "Unauthorized"}, 401)
            return
        orders = query(
            """SELECT o.*, string_agg(
                 concat(oi.quantity, ' x ', p.name), ' | ') AS items
               FROM orders o
               LEFT JOIN order_items oi ON oi.order_id = o.id
               LEFT JOIN products p ON p.id = oi.product_id
               GROUP BY o.id
               ORDER BY o.order_date DESC"""
        )
        self._json({"orders": orders})

    def handle_admin_update_order(self, oid):
        """PUT /api/admin/orders/<id> with {"order_status": "..."}."""
        if not self._check_admin():
            self._json({"error": "Unauthorized"}, 401)
            return
        existing = query("SELECT id FROM orders WHERE id = %s", (oid,), fetchone=True)
        if not existing:
            self._json({"error": "Order not found"}, 404)
            return
        data = read_json_body(self)
        order_status = str(data.get("order_status", "")).strip()
        valid_statuses = ("pending", "processing", "shipped", "delivered", "cancelled")
        if order_status not in valid_statuses:
            self._json({"error": "Invalid order status"}, 400)
            return
        execute(
            "UPDATE orders SET order_status = %s WHERE id = %s",
            (order_status, oid),
        )
        self._json({"success": True, "id": oid, "order_status": order_status})


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    server = ThreadingHTTPServer((HOST, PORT), PlantHandler)
    print(f"Plant Shop server running at http://{HOST}:{PORT}")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.server_close()


if __name__ == "__main__":
    main()
