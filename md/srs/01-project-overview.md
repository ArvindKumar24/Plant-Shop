# 1. Project Overview

## 1.1 Title

**GreenLeaf Plants — Indoor & Outdoor Plant E-Commerce Website**

A low-code, full-stack e-commerce web application that enables customers to browse, search, filter, and purchase indoor and outdoor plants online, while providing administrators with a dashboard to manage products, orders, and payment configurations.

---

## 1.2 Objectives

The GreenLeaf Plants project has been developed to achieve the following objectives:

1. **Provide an Accessible Online Plant Store** — Allow customers to browse a curated catalogue of indoor and outdoor plants from any device, without requiring installation or a login to view products.

2. **Enable Seamless Product Discovery** — Offer powerful search and filtering capabilities (by keyword, category, plant type, and price range) so customers can quickly find suitable plants.

3. **Support a Complete Purchase Flow** — Implement a full e-commerce journey from adding items to a cart, through checkout, to order placement with multiple payment options (Cash on Delivery, UPI, and Card).

4. **Offer Order Tracking** — Let customers view their order history and track the fulfilment status of each order (pending → processing → shipped → delivered).

5. **Provide an Admin Management Interface** — Allow administrators to add, edit, and delete products, view and update order statuses, and configure the UPI payment QR code.

6. **Demonstrate Strong Security Practices** — Use parameterized SQL queries, password hashing, token-based authentication, and input validation to protect the application and its users.

7. **Build a Lightweight, Low-Dependency System** — Show that a fully functional e-commerce platform can be built with pure Python, MySQL, and vanilla JavaScript without heavyweight frameworks.

8. **Serve as an Educational & Reference Implementation** — Provide a clear, well-documented codebase and accompanying SRS for learning, demonstration, and future extension.

---

## 1.3 Scope of the Project

### 1.3.1 In-Scope Features

The following features are within the scope of the GreenLeaf Plants system:

**Customer-Facing Features**
- User registration and login (email + password)
- Browse indoor and outdoor plant catalogue
- Search by name, plant type, or description keywords
- Filter by category, plant type, and price range
- Product detail page with image, price, stock, and description
- Cart management with add/remove/update quantities (stored in `localStorage`)
- Checkout with **Cash on Delivery**, **UPI (QR code)**, or **Card** (simulated)
- **My Orders** page to view order history and track fulfilment status
- Login required for adding to cart and placing orders (browsing/searching is public)
- Fully responsive UI for desktop and mobile

**Admin-Facing Features**
- Admin login (`admin` / `admin123`)
- Add, edit, and delete products
- View customer orders and payment status
- Update order fulfilment status
- Configure the UPI payment QR code

**Technical Features**
- Pure Python REST API server (`http.server`)
- MySQL relational database with connection pooling
- Parameterized SQL to prevent SQL injection
- SHA-256 password hashing
- Token-based authentication (Base64 of `email:password`)
- Path traversal protection for static file serving
- CORS support

### 1.3.2 Out-of-Scope Features

The following are **explicitly out of scope** for the current version:

- Real payment gateway integration (card payment is simulated; UPI uses a generated QR code)
- Advanced inventory and warehouse management
- Product reviews and ratings
- Order cancellation by customers (only admin can update status)
- Email/SMS notifications
- Mobile native applications
- Multi-language support
- Advanced analytics / business intelligence dashboards
- User profile management (address book, wishlist)

### 1.3.3 Target Users

| User Role | Description |
|-----------|-------------|
| **Guest Customer** | Can browse and search products without logging in. |
| **Registered Customer** | Can log in, add to cart, place orders, and track order status. |
| **Administrator** | Can manage products, orders, and payment settings via the admin dashboard. |

### 1.3.4 Operating Environment

| Component | Technology |
|-----------|------------|
| **Server** | Python 3.9+ running `server.py` |
| **Database** | MySQL 8.x (`plant_shop` schema) |
| **Client** | Any modern web browser (Chrome, Firefox, Edge, Safari) |
| **OS** | Windows 11, macOS, Linux |

---

## 1.4 Video / Visual Demonstration

The application runs at `http://127.0.0.1:8000`. The full setup procedure is documented in `md/SETUP-GUIDE.md`. A walkthrough of the interface is provided in Section 10 (`10-website-demo.md`).
