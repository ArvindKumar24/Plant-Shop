# Order Status Update Feature (Admin Side) — Task Plan

## Goal
Allow admins to update the fulfillment status of orders (pending → processing → shipped → delivered, plus cancelled) from the admin dashboard.

## Steps
- [x] 1. `database/schema.sql`: Add `order_status ENUM('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending'` column to `orders` table.
- [x] 2. `backend/server.py`: Default `order_status` to `'pending'` when creating an order; add `handle_admin_update_order` (PUT `/api/admin/orders/<id>`); route the PUT request in `do_PUT`; include `order_status` in admin orders response.
- [x] 3. `frontend/js/api.js`: Add `adminUpdateOrderStatus(token, id, status)` helper.
- [x] 4. `frontend/js/admin.js`: Update `loadOrders()` to render an order status column with an inline dropdown select that calls the API on change.
- [x] 5. `frontend/admin.html`: Add "Order Status" column header (dynamic table already handled in JS) — minor/no edit needed.
- [x] 6. `frontend/css/styles.css`: Add `.status-select` styling for the dropdown.
- [x] 7. Verify: apply schema (add `order_status` column), restart server, login as admin → orders tab → change status → confirm DB persistence.

---

# Customer "My Orders" Tracking — Task Plan

## Goal
Add a customer-facing "My Orders" section where a logged-in user can view their order history and track fulfillment status (pending → processing → shipped → delivered, plus cancelled).

## Steps
- [x] 1. `backend/server.py`: Add `handle_my_orders` (GET `/api/orders`) returning the authenticated user's orders; route it in `do_GET`.
- [x] 2. `frontend/js/api.js`: Add `getMyOrders(token)` helper.
- [x] 3. `frontend/js/orders.js` (new): Render the user's orders with status badges and a progress tracker.
- [x] 4. `frontend/orders.html` (new): New "My Orders" page with the standard header nav.
- [x] 5. Nav: Add a "My Orders" link to the header on all customer-facing pages (`index.html`, `products.html`, `product.html`, `cart.html`, `checkout.html`, `login.html`, `register.html`).
- [x] 6. `frontend/css/styles.css`: Add styles for the orders page and progress tracker.
- [x] 7. `README.md`: Document the new `GET /api/orders` endpoint and the My Orders page.
- [x] 8. `frontend/js/checkout.js`: Add a "Track My Order" button to the order-success message linking to `orders.html`.
- [x] 9. Verify: restart server, login as a customer, place an order, then view "My Orders" to confirm the order and its status appear correctly.

---

# Vercel Deployment — Task Plan

## Goal
Refactor the app so it can be deployed on Vercel (serverless). This requires converting the `http.server` backend to a Flask WSGI app, reading DB config from environment variables, and adding Vercel deployment files.

## Steps
- [x] 1. `backend/app.py` (new): Flask app with all REST API routes + static file serving (mirrors `server.py` logic).
- [x] 2. `backend/config.py`: Read `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` from environment variables.
- [x] 3. `backend/requirements.txt`: Add `flask`.
- [x] 4. `requirements.txt` (root): Add Flask + mysql-connector-python + werkzeug for Vercel's Python builder.
- [x] 5. `api/index.py` (new): Vercel serverless WSGI entry point that imports the Flask `app`.
- [x] 6. `vercel.json`: Serve `frontend/` as static output, route `/api/*` to the Python function.
- [x] 7. `DEPLOY-VERCEL.md` (new): Step-by-step deployment guide (cloud MySQL, env vars, deploy, verify).
- [x] 8. `.env` (new): Create local environment-template file with DB_* variables; `.env.example` and `.gitignore` added; `backend/config.py` loads `.env` via `python-dotenv` and supports `DB_SSL_DISABLED`.
- [ ] 9. Verify: create cloud MySQL, import schema, set env vars in Vercel, deploy, confirm storefront + API + admin work.
