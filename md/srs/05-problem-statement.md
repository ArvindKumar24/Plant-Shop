# 5. Problem Statement

## 5.1 Background of the Problem

Plant retail, especially in local nurseries and garden centres, has traditionally operated as a **brick-and-mortar** business. Customers must physically visit a store to see, select, and purchase plants. This model presents several limitations in the digital age:

- **Limited Reach** — A physical store can only serve customers within its immediate geographic area.
- **No Always-On Availability** — Customers cannot browse or shop outside store hours.
- **Manual Inventory Management** — Stock is often tracked in notebooks, leading to inaccuracies and no real-time visibility.
- **Untracked Orders** — Orders placed over the phone or WhatsApp have no formal status tracking; customers cannot know when their order is being processed, shipped, or delivered.
- **Minimal Product Information** — Customers often rely on staff for care details, which is not scalable.

Observational and survey data (Sections 2 & 4) confirmed that **68% of respondents had difficulty finding a specific plant locally**, **87% wanted to track their orders**, and many wanted **clear photos, descriptions, and multiple payment options**. These unmet needs form the basis of the problem this project addresses.

---

## 5.2 Key Problems Identified

| # | Problem | Description |
|---|---------|-------------|
| 1 | **Limited customer reach** | Physical nurseries serve only nearby customers; no online presence. |
| 2 | **Manual & inaccurate inventory** | Stock tracked in notebooks causes overselling and stock mismatches. |
| 3 | **No online ordering** | Customers cannot place orders remotely or at any time. |
| 4 | **No order tracking** | Phone/WhatsApp orders lack status visibility (pending/processing/shipped/delivered). |
| 5 | **Insufficient product information** | Customers lack photos, descriptions, and care instructions before buying. |
| 6 | **Limited payment options** | Cash-only transactions reduce convenience; UPI adoption is growing but not supported. |
| 7 | **No admin management tool** | The owner has no simple dashboard to add/edit/delete products or manage orders. |
| 8 | **Security concerns** | Any online system must handle credentials, data, and SQL injection safely. |

---

## 5.3 Significance of the Study

This project is significant for several reasons:

### 5.3.1 For Customers
- Provides a **convenient, always-available** way to discover and purchase plants from home.
- Offers **rich product information** (photos, descriptions, care guidance) to support informed decisions.
- Enables **multiple payment methods** (Cash, UPI, Card) to suit different preferences.
- Delivers **order tracking** so customers always know the status of their purchases.

### 5.3.2 For the Shop Owner / Administrator
- Replaces **manual notebook inventory** with a digital dashboard for product & stock management.
- Automates order management with a **clear status pipeline**.
- Provides **configurable UPI payments** to match how customers pay today.
- Expands the business reach **beyond the local area**.

### 5.3.3 For the Technical / Educational Context
- Demonstrates a **complete, low-code e-commerce solution** built with pure Python, MySQL, and vanilla JavaScript.
- Serves as a **reference implementation** for security best practices (parameterized SQL, hashing, tokens, input validation) and clean architecture.
- Provides a **scalable foundation** that can later be migrated to production frameworks or real payment gateways.

---

## 5.4 Proposed Solution

To address the identified problems, the project proposes the **GreenLeaf Plants** e-commerce website — a low-code, full-stack web application with the following core components:

### 5.4.1 Customer-Facing Web Store
- Public **browse/search/filter** of indoor and outdoor plants.
- **Product detail pages** with images, price, description, care info, and live stock indicators.
- **Registration & login** for customers.
- **Shopping cart** (stored in `localStorage`) with quantity management.
- **Checkout** supporting Cash on Delivery, UPI (QR code), and Card (simulated).
- **My Orders** page with order history and a fulfilment **progress tracker**.

### 5.4.2 Admin Dashboard
- **Product management** (add, edit, delete) with control over price, stock, category, and image.
- **Order management** with the ability to update status (pending → processing → shipped → delivered / cancelled).
- **Payment settings** to configure the UPI ID and payee name and generate the QR code.

### 5.4.3 Technical Backend
- A **pure Python REST API** (`http.server`) serving JSON endpoints and static files.
- A **MySQL database** (`plant_shop`) with five normalized tables and seed data.
- **Security measures** including parameterized SQL, SHA-256 password hashing, token-based authentication, CORS, and path-traversal protection.

### 5.4.4 Alignment with Survey & Field Findings

| Problem | Solution Element |
|---------|------------------|
| Limited reach | Online catalogue accessible from any device/browser |
| Manual inventory | Admin product & stock CRUD |
| No online ordering | Full cart + checkout flow |
| No order tracking | My Orders progress tracker + admin status updates |
| Insufficient product info | Rich product detail pages with descriptions & stock badges |
| Limited payments | Cash, UPI, Card options |
| No admin tool | Admin dashboard with Products/Orders/Payment tabs |
| Security | Parameterized SQL, hashing, tokens, validation |

---

## 5.5 Expected Outcomes

Upon successful implementation, the system should:

1. Allow guests to browse and search all plants without logging in.
2. Let registered customers add to cart, check out, and place orders.
3. Enable customers to track order status in real time.
4. Provide admins full control over products, orders, and UPI settings.
5. Maintain data integrity and security throughout.
6. Run reliably on a lightweight, low-dependency stack.
