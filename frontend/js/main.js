/**
 * main.js - Shared logic for all pages (cart badge, auth UI refresh).
 */

/** Update the cart count badge in the header. */
function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.querySelector("#cart-count");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-block" : "none";
  }
}

/** Header initialization. */
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderAuthNav();
});

