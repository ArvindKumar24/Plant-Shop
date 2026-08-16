/**
 * api.js - Fetch helpers for the Plant Shop frontend.
 * Communicates with the Python backend REST API.
 */

const API = {
  // GET products with optional filter params
  getProducts: async (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        qs.append(key, val);
      }
    });
    const res = await fetch(`/api/products?${qs.toString()}`);
    return res.json();
  },

  // GET single product
  getProduct: async (id) => {
    const res = await fetch(`/api/products/${id}`);
    return res.json();
  },

  // POST create order (requires auth token)
  createOrder: async (orderData, token) => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(orderData),
    });
    return res.json();
  },

  // ---------- Customer Auth ----------
  register: async (userData) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  login: async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  getMe: async (token) => {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // GET current user's orders (requires login)
  getMyOrders: async (token) => {
    const res = await fetch("/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // ---------- Product Reviews ----------
  // GET reviews for a product (public)
  getProductReviews: async (id) => {
    const res = await fetch(`/api/products/${id}/reviews`);
    return res.json();
  },

  // POST submit/edit the caller's review for a product (requires login)
  submitProductReview: async (id, token, data) => {
    const res = await fetch(`/api/products/${id}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // DELETE the caller's own review for a product (requires login)
  deleteProductReview: async (id, token) => {
    const res = await fetch(`/api/products/${id}/reviews`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // ---------- Admin ----------
  adminLogin: async (username, password) => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  adminGetProducts: async (token) => {
    const res = await fetch("/api/admin/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  adminAddProduct: async (token, product) => {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(product),
    });
    return res.json();
  },

  adminUpdateProduct: async (token, id, product) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(product),
    });
    return res.json();
  },

  adminDeleteProduct: async (token, id) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  adminGetOrders: async (token) => {
    const res = await fetch("/api/admin/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  adminUpdateOrderStatus: async (token, id, orderStatus) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ order_status: orderStatus }),
    });
    return res.json();
  },

  adminGetReviews: async (token) => {
    const res = await fetch("/api/admin/reviews", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  adminDeleteReview: async (token, id) => {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};

/** Format a number as currency. */
function formatPrice(price) {
  return `₹${Number(price).toFixed(2)}`;
}

/** Build product image URL with fallback placeholder. */
function productImage(product) {
  return product.image_url || "https://via.placeholder.com/400x300/4caf50/ffffff?text=Plant";
}

/**
 * Render a read-only star rating (★ filled/empty) for a 1-5 value.
 * Ratings are rounded to the nearest whole star for display.
 */
function renderStars(rating) {
  const r = Number(rating) || 0;
  const filled = Math.max(0, Math.min(5, Math.round(r)));
  let html = "";
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star${i <= filled ? " filled" : ""}">★</span>`;
  }
  return `<span class="stars">${html}</span>`;
}

/** Show a toast notification. */
function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}
