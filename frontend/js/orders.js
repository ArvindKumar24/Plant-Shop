/**
 * orders.js - Customer "My Orders" page logic.
 * Loads the logged-in user's orders and shows their fulfilment status.
 */

const ORDER_TRACK_STEPS = ["pending", "processing", "shipped", "delivered"];

/** Return a styled badge for a given order status. */
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

/** Build an HTML progress tracker for the order status. */
function orderProgress(status) {
  if (status === "cancelled") {
    return `<div class="order-track"><p style="color:#c62828;font-weight:600">This order was cancelled.</p></div>`;
  }
  const currentIndex = ORDER_TRACK_STEPS.indexOf(status);
  const steps = ORDER_TRACK_STEPS.map((step, i) => {
    const state = i < currentIndex ? "done" : (i === currentIndex ? "active" : "pending");
    return `
      <div class="track-step ${state}">
        <div class="track-dot"></div>
        <span class="track-label">${step}</span>
      </div>`;
  }).join("");
  return `<div class="order-track">${steps}</div>`;
}

/** Render the user's orders into #orders-container. */
async function renderOrders() {
  if (!requireAuth()) return;

  const container = document.getElementById("orders-container");
  container.innerHTML = `<div class="empty"><h2>Loading your orders...</h2></div>`;

  try {
    const result = await API.getMyOrders(getAuthToken());
    if (result.error) {
      container.innerHTML = `<div class="empty"><h2>${escapeHtml(result.error)}</h2></div>`;
      return;
    }
    const orders = result.orders || [];
    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty">
          <h2>No orders yet</h2>
          <p>When you place an order, you can track its status here.</p>
          <a href="products.html" class="btn">Shop Plants</a>
        </div>`;
      return;
    }

    container.innerHTML = orders.map((o) => `
      <div class="order-card">
        <div class="order-head">
          <div>
            <strong>Order #${o.id}</strong>
            <div class="order-date">${new Date(o.order_date).toLocaleString()}</div>
          </div>
          <div class="order-status">${orderStatusBadge(o.order_status || "pending")}</div>
        </div>
        <div class="order-body">
          <div class="order-items">
            ${(o.items || "-").split(" | ").map((it) => `<div class="order-item">🌿 ${it}</div>`).join("")}
          </div>
          <div class="order-meta">
            <div><span>Items:</span> <strong>${formatPrice(o.total_amount)}</strong></div>
            <div><span>Payment:</span> <strong>${(o.payment_method || "").toUpperCase()}</strong></div>
            <div><span>Status:</span> <strong class="capitalize">${o.order_status || "pending"}</strong></div>
          </div>
        </div>
        ${orderProgress(o.order_status || "pending")}
      </div>
    `).join("");
  } catch (e) {
    container.innerHTML = `<div class="empty"><h2>Could not load your orders</h2><p>Please check your connection and try again.</p></div>`;
  }
}

document.addEventListener("DOMContentLoaded", renderOrders);
