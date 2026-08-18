/**
 * main.js - Shared logic for all pages (cart badge, auth UI, hamburger, active links).
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

/** Initialize hamburger menu toggle. */
function initHamburger() {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");
  const overlay = document.getElementById("nav-overlay");
  if (!hamburger || !navLinks) return;

  function closeMenu() {
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
    if (overlay) overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  function openMenu() {
    hamburger.classList.add("open");
    navLinks.classList.add("open");
    if (overlay) overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  hamburger.addEventListener("click", function () {
    if (navLinks.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }

  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });
}

/** Highlight the active nav link based on current page URL. */
function setActiveLink() {
  var path = window.location.pathname.split("/").pop() || "index.html";
  var params = new URLSearchParams(window.location.search);
  var category = params.get("category");
  var navLinks = document.getElementById("nav-links");
  if (!navLinks) return;

  navLinks.querySelectorAll("a").forEach(function (link) {
    link.classList.remove("active");
    var href = link.getAttribute("href") || "";
    var linkPage = href.split("?")[0].split("#")[0];

    if (linkPage === path) {
      if (path === "products.html" && category) {
        if (href.indexOf("category=" + category) !== -1) {
          link.classList.add("active");
        }
      } else {
        link.classList.add("active");
      }
    }
  });
}

/** Header initialization. */
document.addEventListener("DOMContentLoaded", function () {
  updateCartBadge();
  renderAuthNav();
  initHamburger();
  setActiveLink();
});

