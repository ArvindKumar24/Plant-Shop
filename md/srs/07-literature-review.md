# 7. Literature Review

## 7.1 Introduction

This literature review examines prior research and practice relevant to the development of an e-commerce plant store. It covers online commerce adoption, e-commerce system architectures, security best practices, and the specific domain of selling plants and gardening products online. The review establishes the theoretical and technical foundation for the GreenLeaf Plants system.

---

## 7.2 E-Commerce and Customer Behaviour

E-commerce has transformed how consumers discover and purchase products. Research highlights that **convenience, product information, payment flexibility, and order transparency** are among the strongest drivers of online shopping adoption.

Key findings from literature relevant to this project:

| Topic | Finding | Relevance to GreenLeaf Plants |
|-------|---------|-------------------------------|
| **Convenience** | Consumers value 24/7 access and home delivery. | The system is always online and collects delivery addresses for home delivery. |
| **Product Information** | Rich images and descriptions reduce purchase hesitation, especially for products that cannot be inspected in person. | Product detail pages include image, price, description, category, plant type, and stock. |
| **Payment Flexibility** | Offering multiple payment methods (COD, UPI, cards) increases conversion and trust. | Checkout supports Cash on Delivery, UPI (QR), and Card. |
| **Order Tracking** | Transparency in order status improves satisfaction and reduces support queries. | My Orders page provides a progress tracker (pending → processing → shipped → delivered). |
| **Search & Filter** | Effective search/filter improves product discovery and reduces friction. | Products page offers search plus category, plant type, and price filters. |

---

## 7.3 Low-Code and Lightweight Web Architectures

The GreenLeaf Plants system deliberately uses a **pure Python HTTP server**, **MySQL**, and **vanilla JavaScript** rather than heavy frameworks. This approach aligns with literature on **lightweight, low-code solutions** for small to medium projects:

- **Minimal Dependencies** — Reducing dependencies lowers deployment complexity, maintenance cost, and attack surface.
- **Rapid Prototyping** — Low-code and framework-free approaches allow functional prototypes to be delivered quickly, which suits small businesses and educational projects.
- **Full Control** — Using the standard library (`http.server`) gives developers direct control over routing, headers, and behaviour without framework abstractions.

This trade-off (less developer convenience vs. more simplicity and control) is accepted because the project targets a **small-to-medium catalogue** and **low traffic**, where the performance and maintainability requirements are modest.

---

## 7.4 REST API Design

The backend exposes a **RESTful JSON API**, a widely recommended pattern in modern web development. Literature on API design emphasizes:

- **Resource-Oriented Endpoints** — e.g., `/api/products`, `/api/orders`, `/api/admin/products/:id`.
- **HTTP Method Semantics** — `GET` to read, `POST` to create, `PUT` to update, `DELETE` to remove.
- **Stateless Requests** — Each request is self-contained; authentication relies on per-request tokens.
- **Clear Status Codes** — `200`, `201`, `400`, `401`, `404`, `409`, `500` are used appropriately.

These principles are evidenced in `backend/server.py`, which routes based on path and HTTP method and returns consistent JSON responses.

---

## 7.5 Database Design (Relational & Normalization)

Relational database design and **normalization** are well-established in literature as methods to ensure data integrity and reduce redundancy. The GreenLeaf schema applies these principles:

- **Normalized Tables** — `users`, `products`, `orders`, `order_items`, `admin_users` separate distinct entities.
- **Primary & Foreign Keys** — Relationships are enforced (e.g., `orders.user_id → users.id`, `order_items.order_id → orders.id` with `ON DELETE CASCADE`).
- **ENUM Constraints** — Defined allowed values for `category`, `payment_method`, `payment_status`, and `order_status`, preventing invalid data.
- **Indexing** — `email` in `users` and `username` in `admin_users` are UNIQUE, indexing lookups for login.

### 7.5.1 Connection Pooling

Literature and MySQL best practices recommend **connection pooling** to avoid the overhead of creating a new connection per request. `backend/database.py` implements a `MySQLConnectionPool(pool_size=5)` that reuses connections, improving concurrency and performance.

---

## 7.6 Application Security

Security is a core consideration in any web application. The literature and OWASP guidance identify several threats that GreenLeaf Plants addresses:

| Threat | Mitigation in GreenLeaf Plants |
|--------|--------------------------------|
| **SQL Injection** | Parameterized queries with `%s` placeholders in `database.query()` / `database.execute()`. |
| **Password Exposure** | SHA-256 hashing of passwords before storage; plaintext is never stored. |
| **Unauthorized Access** | Token-based authentication for both customer and admin routes; 401 on invalid/absent token. |
| **Path Traversal** | Path normalization and containment check in `_serve_static()`. |
| **Cross-Site Scripting (XSS)** | `escapeHtml()` escapes user data before insertion into the DOM. |
| **Input Validation** | Server-side validation of product, registration, login, and order data. |

These measures reflect established OWASP Top 10 mitigations and good practice for small web applications.

---

## 7.7 Domain-Specific: E-Commerce for Plants & Gardening

The literature on **plant and gardening e-commerce** notes several domain-specific considerations:

- **Perishable & Seasonal Stock** — Plants are living goods; stock levels change quickly and must be tracked accurately. This supports the need for admin stock management and stock badges.
- **Browsing by Type** — Customers often search by plant care category (succulent, foliage, flowering, herb, vegetable), validating the `plant_type` field and filter.
- **Trust & Information** — Because plants cannot be inspected online, descriptive text and images are critical, justifying the rich product detail page.
- **Payment in Local Markets** — Cash on Delivery and UPI are popular in many markets, supporting the choice of these payment methods.

---

## 7.8 Gaps Identified in Literature & Practice

While existing literature covers general e-commerce and security, most published frameworks are **over-engineered for small retail** and assume **real payment gateways**. GreenLeaf Plants intentionally:

- Uses a **simple, dependency-light stack** for easy deployment.
- **Simulates** card payment and uses a **generated UPI QR code**, consciously trading full gateway integration for simplicity in a low-traffic context.
- Is **documented end-to-end** as an educational/reference implementation, filling a gap for a complete, self-contained e-commerce example.

---

## 7.9 Summary

The literature supports the architectural and security decisions made in the GreenLeaf Plants system: a lightweight, three-tier e-commerce application with a normalized relational database, a RESTful Python API, token-based authentication, and strong input/query security. Domain-specific findings on plant retail reinforce the inclusion of rich product information, type-based filtering, flexible payments, and order tracking. This foundation ensures the proposed solution is both technically sound and aligned with customer needs identified in the survey and field visit.
