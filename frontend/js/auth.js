/**
 * auth.js - Client-side authentication helpers for the customer-facing pages.
 * Uses a token (base64 of email:password) stored in sessionStorage so the
 * customer session ends automatically when the browser tab/window is closed.
 */

const AUTH_TOKEN_KEY = "plant_shop_user_token";
const AUTH_USER_KEY = "plant_shop_user";

// Use sessionStorage for customer auth so that the session ends automatically
// when the browser tab/window is closed.

/** Return the stored auth token (or empty string). */
function getAuthToken() {
  return sessionStorage.getItem(AUTH_TOKEN_KEY) || "";
}

/** Return the stored user object (or null). */
function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem(AUTH_USER_KEY)) || null;
  } catch (e) {
    return null;
  }
}

/** True if the user has a stored token. */
function isLoggedIn() {
  return !!getAuthToken();
}

/** Persist the auth token and user info. */
function setAuth(token, user) {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

/** Clear stored auth data. */
function clearAuth() {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
  renderAuthNav();
}

/** Redirect to the login page if not authenticated. Returns true if authed. */
function requireAuth() {
  if (!isLoggedIn()) {
    const current = window.location.pathname.split("/").pop();
    window.location.href = "login.html?redirect=" + encodeURIComponent(current);
    return false;
  }
  return true;
}

/** Render the auth section of the site header (#auth-nav). */
function renderAuthNav() {
  const nav = document.querySelector("#auth-nav");
  if (!nav) return;
  if (isLoggedIn()) {
    const user = getCurrentUser() || { name: "" };
    nav.innerHTML =
      "<span style='color:#fff;font-size:0.9rem;margin-right:0.4rem'>👤 " +
      escapeHtml(user.name) + "</span>" +
      "<a href='javascript:void(0)' onclick='logout()' style='color:#fff;font-weight:600'>Logout</a>";
  } else {
    nav.innerHTML =
      "<a href='login.html' style='color:#fff;font-weight:600'>Login</a> " +
      "<a href='register.html' style='color:#fff;font-weight:600'>Register</a>";
  }
}

/** Log the current user out. */
function logout() {
  clearAuth();
  window.location.href = "index.html";
}

/** Minimal HTML escape helper. */
function escapeHtml(str) {
  var amp = String.fromCharCode(38);
  var s = String(str);
  s = s.replace(/&/g, amp + "amp;");
  s = s.replace(/</g, amp + "lt;");
  s = s.replace(/>/g, amp + "gt;");
  s = s.replace(/"/g, amp + "quot;");
  s = s.replace(/'/g, amp + "#39;");
  return s;
}

/** On page load, render the auth nav (if the element exists). */
document.addEventListener("DOMContentLoaded", renderAuthNav);
