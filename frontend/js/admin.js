/**
 * admin.js - Admin dashboard logic: login, product CRUD, orders, UPI settings.
 */

let adminToken = localStorage.getItem("plant_shop_admin_token") || "";
let editingProductId = null;

const loginView = document.getElementById("login-view");
const panelView = document.getElementById("panel-view");

function setAuth(token) {
  adminToken = token;
  if (token) {
    localStorage.setItem("plant_shop_admin_token", token);
    loginView.style.display = "none";
    panelView.style.display = "block";
    loadProducts();
    loadOrders();
    loadReviews();
  } else {
    localStorage.removeItem("plant_shop_admin_token");
    loginView.style.display = "block";
    panelView.style.display = "none";
  }
}

// ---------- Login ----------
document.getElementById("admin-login-btn").addEventListener("click", async () => {
  const username = document.getElementById("admin-username").value.trim();
  const password = document.getElementById("admin-password").value;
  const err = document.getElementById("login-error");
  err.textContent = "";
  const result = await API.adminLogin(username, password);
  if (result.success) {
    setAuth(result.token);
  } else {
    err.textContent = result.error || "Invalid credentials.";
  }
});

document.getElementById("logout-btn").addEventListener("click", () => setAuth(""));

// ---------- Tabs ----------
document.querySelectorAll(".admin-tabs button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".admin-tabs button").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

// ---------- Products ----------
async function loadProducts() {
  const result = await API.adminGetProducts(adminToken);
  if (result.error) { setAuth(""); return; }
  const products = result.products || [];
  document.getElementById("products-table-container").innerHTML = `
    <table class="admin-table">
      <thead>
        <tr><th>Image</th><th>Name</th><th>Category</th><th>Type</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
      </thead>
      <tbody>
        ${products.map((p) => `
          <tr>
            <td><img src="${productImage(p)}" class="thumb" onerror="this.src='https://via.placeholder.com/100x100/4caf50/ffffff?text=Plant';this.classList.add('no-img')"></td>
            <td>${p.name}</td>
            <td><span class="badge ${p.category}">${p.category}</span></td>
            <td>${p.plant_type}</td>
            <td>${formatPrice(p.price)}</td>
            <td>${p.stock}</td>
            <td>
              <div class="admin-actions">
                <button class="btn" onclick="openEdit(${p.id}, '${p.name.replace(/'/g, "\\'")}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>`;
}

document.getElementById("add-product-btn").addEventListener("click", () => openModal());

function openModal() {
  editingProductId = null;
  document.getElementById("modal-title").textContent = "Add Product";
  document.getElementById("p-name").value = "";
  document.getElementById("p-category").value = "indoor";
  document.getElementById("p-plant_type").value = "";
  document.getElementById("p-price").value = "";
  document.getElementById("p-stock").value = "10";
  document.getElementById("p-image_url").value = "";
  document.getElementById("p-description").value = "";
  document.getElementById("product-modal").classList.add("show");
}

function openEdit(id, name) {
  // We could fetch the product; simpler to fetch all and find by id.
  API.adminGetProducts(adminToken).then((result) => {
    const p = (result.products || []).find((x) => x.id === id);
    if (!p) return;
    editingProductId = id;
    document.getElementById("modal-title").textContent = `Edit: ${p.name}`;
    document.getElementById("p-name").value = p.name;
    document.getElementById("p-category").value = p.category;
    document.getElementById("p-plant_type").value = p.plant_type;
    document.getElementById("p-price").value = p.price;
    document.getElementById("p-stock").value = p.stock;
    document.getElementById("p-image_url").value = p.image_url || "";
    document.getElementById("p-description").value = p.description || "";
    document.getElementById("product-modal").classList.add("show");
  });
}

document.getElementById("modal-cancel").addEventListener("click", () => {
  document.getElementById("product-modal").classList.remove("show");
});

document.getElementById("modal-save").addEventListener("click", async () => {
  const product = {
    name: document.getElementById("p-name").value.trim(),
    category: document.getElementById("p-category").value,
    plant_type: document.getElementById("p-plant_type").value.trim(),
    price: parseFloat(document.getElementById("p-price").value),
    stock: parseInt(document.getElementById("p-stock").value, 10) || 0,
    image_url: document.getElementById("p-image_url").value.trim(),
    description: document.getElementById("p-description").value.trim(),
  };
  if (!product.name) { alert("Name is required."); return; }
  if (isNaN(product.price) || product.price < 0) { alert("Valid price is required."); return; }

  let result;
  if (editingProductId) {
    result = await API.adminUpdateProduct(adminToken, editingProductId, product);
  } else {
    result = await API.adminAddProduct(adminToken, product);
  }
  if (result.success) {
    document.getElementById("product-modal").classList.remove("show");
    loadProducts();
    showToast(editingProductId ? "Product updated" : "Product added");
  } else {
    alert(result.error || "Could not save product.");
  }
});

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  const result = await API.adminDeleteProduct(adminToken, id);
  if (result.success) {
    loadProducts();
    showToast("Product deleted");
  } else {
    alert(result.error || "Could not delete product.");
  }
}

// ---------- Orders ----------
const ORDER_STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

function orderStatusBadge(status) {
  const styles = {
    pending:   { bg: "#fff3e0", color: "#e65100" },
    processing:{ bg: "#e3f2fd", color: "#0d47a1" },
    shipped:   { bg: "#f3e5f5", color: "#6a1b9a" },
    delivered: { bg: "#e8f5e9", color: "#2e7d32" },
    cancelled: { bg: "#fdecea", color: "#c62828" },
  };
  const s = styles[status] || styles.pending;
  return `<span class="badge" style="background:${s.bg};color:${s.color}">${status}</span>`;
}

async function changeOrderStatus(orderId, selectEl) {
  const newStatus = selectEl.value;
  selectEl.disabled = true;
  try {
    const result = await API.adminUpdateOrderStatus(adminToken, orderId, newStatus);
    if (result.success) {
      showToast(`Order #${orderId} status updated to ${newStatus}`);
      // Reload so the order moves to the correct section (active vs completed)
      loadOrders();
    } else {
      alert(result.error || "Could not update order status.");
      // Revert dropdown to reflect the saved status
      loadOrders();
    }
  } catch (err) {
    alert("Could not update order status.");
    loadOrders();
  }
}

const ACTIVE_STATUSES = ["pending", "processing", "shipped"];
const COMPLETED_STATUSES = ["delivered", "cancelled"];

/** Render an orders table (or an empty state) into a container. */
function renderOrdersTable(orders, containerId, emptyMessage) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = orders.length
    ? `<table class="admin-table">
        <thead>
          <tr><th>Order ID</th><th>Customer</th><th>Phone</th><th>Items</th><th>Total</th><th>Method</th><th>Payment</th><th>Order Status</th><th>Date</th></tr>
        </thead>
        <tbody>
          ${orders.map((o) => {
            const currentStatus = o.order_status || "pending";
            return `
            <tr>
              <td>#${o.id}</td>
              <td>${o.customer_name}</td>
              <td>${o.customer_phone || "-"}</td>
              <td style="font-size:0.8rem">${o.items || "-"}</td>
              <td>${formatPrice(o.total_amount)}</td>
              <td>${o.payment_method.toUpperCase()}</td>
              <td><span class="badge" style="background:${o.payment_status === 'paid' ? '#e8f5e9' : '#fff3e0'};color:${o.payment_status === 'paid' ? '#2e7d32' : '#e65100'}">${o.payment_status}</span></td>
              <td>
                <select class="status-select" data-order-id="${o.id}" onchange="changeOrderStatus(${o.id}, this)">
                  ${ORDER_STATUS_OPTIONS.map((s) =>
                    `<option value="${s}" ${s === currentStatus ? "selected" : ""}>${s}</option>`
                  ).join("")}
                </select>
                <div style="margin-top:0.25rem">${orderStatusBadge(currentStatus)}</div>
              </td>
              <td>${new Date(o.order_date).toLocaleString()}</td>
            </tr>
          `;
          }).join("")}
        </tbody>
      </table>`
    : `<div class="empty"><h2>${emptyMessage}</h2></div>`;
}

async function loadOrders() {
  const result = await API.adminGetOrders(adminToken);
  if (result.error) { setAuth(""); return; }
  const orders = result.orders || [];
  // Active orders go in the Orders tab; delivered/cancelled go in Completed.
  renderOrdersTable(
    orders.filter((o) => ACTIVE_STATUSES.includes(o.order_status)),
    "orders-table-container",
    "No active orders"
  );
  renderOrdersTable(
    orders.filter((o) => COMPLETED_STATUSES.includes(o.order_status)),
    "completed-table-container",
    "No completed orders"
  );
}

// ---------- Reviews ----------
async function loadReviews() {
  const result = await API.adminGetReviews(adminToken);
  if (result.error) { setAuth(""); return; }
  const reviews = result.reviews || [];
  document.getElementById("reviews-table-container").innerHTML = reviews.length
    ? `<table class="admin-table">
        <thead>
          <tr><th>ID</th><th>Product</th><th>User</th><th>Rating</th><th>Comment</th><th>Date</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${reviews.map((r) => `
            <tr>
              <td>#${r.id}</td>
              <td>${escapeHtml(r.product_name)}</td>
              <td>${escapeHtml(r.user_name)}<br/><span style="font-size:0.7rem;color:var(--text-light)">${escapeHtml(r.user_email || "")}</span></td>
              <td>${renderStars(r.rating)}</td>
              <td style="max-width:320px">${r.comment ? escapeHtml(r.comment) : "-"}</td>
              <td style="white-space:nowrap">${new Date(r.created_at).toLocaleString()}</td>
              <td><button class="btn btn-danger" onclick="deleteReview(${r.id})">Delete</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>`
    : `<div class="empty"><h2>No reviews yet</h2><p>Customer ratings and comments will appear here.</p></div>`;
}

async function deleteReview(id) {
  if (!confirm("Delete this review?")) return;
  const result = await API.adminDeleteReview(adminToken, id);
  if (result.success) {
    loadReviews();
    showToast("Review deleted");
  } else {
    alert(result.error || "Could not delete review.");
  }
}

// ---------- UPI Settings ----------
/** Generate a QR code as a data URL (blank if the library is unavailable). */
function generateQrDataUrl(text, cellSize = 8, margin = 2) {
  if (typeof qrcode !== "function") return "";
  const qr = qrcode(0, "L");
  qr.addData(text);
  qr.make();
  return qr.createDataURL(cellSize, margin);
}

/** Render the admin UPI QR from the current ID/name inputs. */
function refreshSettingsQr() {
  const upiId = document.getElementById("upi-id").value.trim();
  const name = document.getElementById("upi-name").value.trim();
  if (!upiId) { alert("UPI ID is required."); return; }
  const data = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}`;
  document.getElementById("settings-qr").src = generateQrDataUrl(data);
}

document.getElementById("save-upi-btn").addEventListener("click", () => {
  refreshSettingsQr();
  showToast("QR code updated");
});

// Generate the QR immediately on load so the admin always sees it (no external service).
refreshSettingsQr();

// ---------- View Store ----------
// When the admin clicks "View Store", clear the customer auth so the
// storefront opens as a logged-out customer (showing Login/Register buttons).
function viewStore() {
  // Clear customer auth from both storage types so the storefront opens
  // as a logged-out customer (showing Login/Register buttons).
  localStorage.removeItem("plant_shop_user_token");
  localStorage.removeItem("plant_shop_user");
  sessionStorage.removeItem("plant_shop_user_token");
  sessionStorage.removeItem("plant_shop_user");
  window.location.href = "index.html";
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  if (adminToken) {
    setAuth(adminToken);
  }
});
