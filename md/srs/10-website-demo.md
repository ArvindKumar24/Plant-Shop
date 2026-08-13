# 10. Website Interface Demonstration

## 10.1 Overview

This section provides a **walkthrough of the GreenLeaf Plants website prototype**. Screenshots are to be captured by running the application (see `md/SETUP-GUIDE.md`) and inserted at the placeholders. The demonstration is organized by screen, following a typical customer and admin journey.

---

## 10.2 Accessing the Application

1. Start MySQL and the Python server.
2. Open **http://127.0.0.1:8000** in a browser.
3. You will land on the **Home Page**.

---

## 10.3 Customer Interface Demonstration

### 10.3.1 Home Page

```
[ INSERT SCREENSHOT: Home page with hero banner, header nav, and featured
  product grid. ]
```

**What you can do:**
- View the hero banner *"Bring Nature Home"*.
- Click **Shop All Plants** to open the products page.
- See four featured product cards.
- Browse to other pages via the header navigation.

### 10.3.2 Products Page — Search & Filter

```
[ INSERT SCREENSHOT: Products page with the filter bar and product grid. ]
```

**What you can do:**
- Type in the **Search** box (e.g., "snake") — results filter live.
- Select **Indoor** or **Outdoor** category.
- Choose a **Plant Type** (Succulent, Foliage, Flowering, Herb, Vegetable).
- Set **Min** / **Max Price**.
- Click **Apply** or **Clear**.

### 10.3.3 Product Detail Page

```
[ INSERT SCREENSHOT: A product detail page for a single plant. ]
```

**What you can do:**
- View the product image, category/type badges, and stock indicator.
- Read the price and description.
- Adjust quantity with the +/− selector.
- Click **Add to Cart** (requires login).

### 10.3.4 Login & Registration

```
[ INSERT SCREENSHOT: Login page, and the Registration page. ]
```

**What you can do:**
- From the header, click **Login** or **Register**.
- Register with name, email, phone, and password.
- Log in with your email and password.
- Access the **My Orders** link appeared in the header.

### 10.3.5 Cart Page

```
[ INSERT SCREENSHOT: Cart page listing added items and summary. ]
```

**What you can do:**
- View items with thumbnails, names, prices, and quantities.
- Change quantity or remove items.
- See the running total.
- Click **Proceed to Checkout**.

### 10.3.6 Checkout Page

```
[ INSERT SCREENSHOT: Checkout page with delivery details, payment methods, and
  order summary. ]
```

**What you can do:**
- Enter delivery name, phone, email, and address.
- Select a payment method:
  - **Cash on Delivery** — default.
  - **UPI** — reveals a QR code to scan.
  - **Card** — reveals card fields (simulated).
- Review the order summary and total.
- Click **Place Order**.

### 10.3.7 Order Success

```
[ INSERT SCREENSHOT: Order placed success message. ]
```

**What you can do:**
- See the order ID, total, and payment method.
- Click **Track My Order** to go to My Orders.
- Click **Continue Shopping** to return to the catalogue.

### 10.3.8 My Orders (Tracking)

```
[ INSERT SCREENSHOT: My Orders page with order cards and progress trackers. ]
```

**What you can do:**
- View your order history (most recent first).
- See each order's status badge (pending / processing / shipped / delivered / cancelled).
- Follow the progress tracker for each order.
- Recheck later to see the status advance as the admin updates it.

---

## 10.4 Admin Interface Demonstration

### 10.4.1 Admin Login

```
[ INSERT SCREENSHOT: Admin login screen at admin.html. ]
```

**Access:** Go to **http://127.0.0.1:8000/admin.html**.
**Credentials:** Username `admin`, Password `admin123`.

### 10.4.2 Admin Dashboard — Products Tab

```
[ INSERT SCREENSHOT: Admin dashboard Products tab with product table. ]
```

**What you can do:**
- Click **+ Add New Product** to open the add modal.
- Fill in name, category, plant type, price, stock, image URL, description.
- Edit an existing product, or delete a product.
- Watch the table refresh after changes.

### 10.4.3 Admin Dashboard — Orders Tab

```
[ INSERT SCREENSHOT: Admin dashboard Orders tab with order table and status
  dropdowns. ]
```

**What you can do:**
- View all customer orders with items, total, payment method, and payment status.
- Change an order's **status** from the inline dropdown (pending → processing → shipped → delivered / cancelled).

### 10.4.4 Admin Dashboard — Payment Settings Tab

```
[ INSERT SCREENSHOT: Admin dashboard Payment Settings tab with UPI inputs and
  QR preview. ]
```

**What you can do:**
- Enter the UPI ID (e.g., `greenleaf@upi`) and payee name.
- Click **Save & Generate QR**.
- See the updated QR code, which customers would scan at checkout.

---

## 10.5 Walkthrough Summary

| Step | Screen | Key Action |
|------|--------|------------|
| 1 | Home | Open the site |
| 2 | Products | Search & filter plants |
| 3 | Product Detail | View a plant, add to cart (after login) |
| 4 | Register / Login | Create / log into an account |
| 5 | Cart | Review and adjust items |
| 6 | Checkout | Enter details, choose payment, place order |
| 7 | Order Success | View confirmation |
| 8 | My Orders | Track order status |
| 9 | Admin Login | Log in to the admin dashboard |
| 10 | Admin Products | Manage products |
| 11 | Admin Orders | Update order status |
| 12 | Admin Settings | Configure UPI QR |

---

## 10.6 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin123` |
| **Customer** | (register your own) | — |

---

## 10.7 Next Steps After Demonstration

- Capture and attach the screenshots at each placeholder.
- Optionally record a short screen-capture video of the walkthrough.
- Refer to Section 11 for conclusion, limitations, and future scope.
