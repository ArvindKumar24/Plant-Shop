/**
 * login.js - Handles the customer login form.
 * On success stores the token + user, then redirects (to the requested
 * page, cart, or home).
 */

// If already logged in, go straight to the shop.
if (isLoggedIn()) {
  window.location.href = "products.html";
}

document.addEventListener("DOMContentLoaded", () => {
// Format-agnostic redirect target.
  function redirectAfterLogin() {
    let next = new URLSearchParams(window.location.search).get("redirect");
    if (next) {
      // If a full URL was passed, use its pathname only.
      try {
        next = new URL(next, window.location.origin).pathname.split("/").pop() || "index.html";
      } catch (e) { /* keep next as-is */ }
    }
    window.location.href = next || "index.html";
  }

  document.getElementById("login-btn").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const err = document.getElementById("login-error");
    err.textContent = "";

    if (!email || !password) {
      err.textContent = "Please enter your email and password.";
      return;
    }

    const btn = document.getElementById("login-btn");
    btn.disabled = true;
    btn.textContent = "Logging in...";

    try {
      const result = await API.login(email, password);
      if (result.success) {
        setAuth(result.token, result.user);
        redirectAfterLogin();
      } else {
        err.textContent = result.error || "Invalid email or password.";
        btn.disabled = false;
        btn.textContent = "Login";
      }
    } catch (e) {
      err.textContent = "Network error. Please try again.";
      btn.disabled = false;
      btn.textContent = "Login";
    }
  });

  // Allow pressing Enter to submit.
  document.getElementById("password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("login-btn").click();
  });
});
