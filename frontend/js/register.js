/**
 * register.js - Handles the customer registration form.
 * On success auto-logs-in the user and redirects to the shop.
 */

// If already logged in, go straight to the shop.
if (isLoggedIn()) {
  window.location.href = "products.html";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("register-btn").addEventListener("click", async () => {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;
    const err = document.getElementById("reg-error");
    err.textContent = "";

    if (!name || !email || !password) {
      err.textContent = "Please fill in all required fields.";
      return;
    }
    if (password.length < 4) {
      err.textContent = "Password must be at least 4 characters.";
      return;
    }
    if (password !== confirm) {
      err.textContent = "Passwords do not match.";
      return;
    }

    const btn = document.getElementById("register-btn");
    btn.disabled = true;
    btn.textContent = "Creating account...";

    try {
      const result = await API.register({ name, email, phone, password });
      if (result.success) {
        setAuth(result.token, result.user);
        window.location.href = "products.html";
      } else {
        err.textContent = result.error || "Could not create account.";
        btn.disabled = false;
        btn.textContent = "Create Account";
      }
    } catch (e) {
      err.textContent = "Network error. Please try again.";
      btn.disabled = false;
      btn.textContent = "Create Account";
    }
  });

  // Allow pressing Enter to submit.
  document.getElementById("confirm").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("register-btn").click();
  });
});
