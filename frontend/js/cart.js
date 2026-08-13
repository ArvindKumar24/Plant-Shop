/**
 * cart.js - Cart management using localStorage.
 * Cart is stored as an array of { product_id, name, price, image_url, quantity }.
 */

const CART_KEY = "plant_shop_cart";

/** Get the current cart from localStorage. */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

/** Save the cart to localStorage. */
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

/**
 * Register a batch of products so "Add to Cart" buttons can reference them by id.
 * Stored on window so inline onclick handlers from any page can find them.
 */
function registerProducts(products) {
  window.currentProducts = window.currentProducts || {};
  (products || []).forEach((p) => {
    window.currentProducts[p.id] = p;
  });
}

/** Register a single product (used by product detail page). */
function registerProduct(product) {
  registerProducts([product]);
}

/**
 * Add a product to the cart by looking it up in the registered products registry.
 * This avoids embedding raw JSON inside onclick attributes (which breaks the HTML).
 */
function addToCartById(productId, qty = 1) {
  const product = window.currentProducts && window.currentProducts[productId];
  if (!product) {
    showToast("Could not find product details. Please refresh the page.");
    return;
  }
  addToCart(product, qty);
}

/** Add a product to the cart (or increment quantity). Requires login. */
function addToCart(product, qty = 1) {
  // Gate cart addition behind login: guests can browse but not add to cart.
  if (!isLoggedIn()) {
    showToast("Please log in to add items to your cart");
    setTimeout(() => {
      window.location.href = `login.html?redirect=${encodeURIComponent("products.html")}`;
    }, 600);
    return;
  }

  const cart = getCart();
  const existing = cart.find((item) => item.product_id === product.id);
  const quantity = Math.max(1, parseInt(qty, 10) || 1);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity,
    });
  }
  saveCart(cart);
  showToast(`${product.name} added to cart`);
}

/** Update quantity of a cart item. */
function updateCartItem(productId, quantity) {
  const cart = getCart();
  const item = cart.find((it) => it.product_id === productId);
  if (item) {
    item.quantity = Math.max(1, parseInt(quantity, 10) || 1);
    saveCart(cart);
  }
}

/** Remove an item from the cart. */
function removeFromCart(productId) {
  const cart = getCart().filter((it) => it.product_id !== productId);
  saveCart(cart);
}

/** Clear the entire cart. */
function clearCart() {
  saveCart([]);
}

/** Compute the total cart value. */
function cartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/** Total number of items in cart. */
function cartItemCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}
