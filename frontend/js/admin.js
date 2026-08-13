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

async function loadOrders() {
  const result = await API.adminGetOrders(adminToken);
  if (result.error) { setAuth(""); return; }
  const orders = result.orders || [];
  document.getElementById("orders-table-container").innerHTML = orders.length
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
    : `<div class="empty"><h2>No orders yet</h2></div>`;
}

// ---------- UPI Settings ----------
document.getElementById("save-upi-btn").addEventListener("click", () => {
  const upiId = document.getElementById("upi-id").value.trim();
  const name = document.getElementById("upi-name").value.trim();
  if (!upiId) { alert("UPI ID is required."); return; }
  const data = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}`;
  document.getElementById("settings-qr").src =
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
  showToast("QR code updated");
});

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
