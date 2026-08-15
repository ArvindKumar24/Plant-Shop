/**
 * checkout.js - Checkout form, payment method selection, and order submission.
 */

// UPI payment details. The QR code is generated locally (see makeQrDataUrl)
// using the vendored qrcode.js library, so it always renders without depending
// on any external service.
const UPI_ID = "greenleaf@upi";
const UPI_NAME = "GreenLeaf Plants";
const UPI_PAY_DATA = "upi://pay?pa=" + UPI_ID + "&pn=" + encodeURIComponent(UPI_NAME);

/** Generate a UPI QR code as a data URL (blank if the library is unavailable). */
function makeQrDataUrl(text, cellSize = 8, margin = 2) {
  if (typeof qrcode !== "function") return "";
  const qr = qrcode(0, "L");
  qr.addData(text);
  qr.make();
  return qr.createDataURL(cellSize, margin);
}

let selectedPayment = "cash";

function renderCheckout() {
  // Checkout requires login
  if (!requireAuth()) return;

  const cart = getCart();
  const container = document.getElementById("checkout-container");
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <h2>Your cart is empty</h2>
        <a href="products.html" class="btn">Shop Plants</a>
      </div>`;
    return;
  }

  const user = getCurrentUser() || {};

  container.innerHTML = `
    <div class="checkout-grid">
      <div>
        <!-- Customer info -->
        <div class="checkout-section">
          <h3>📋 Delivery Details</h3>
          <div class="form-group">
            <label for="name">Full Name *</label>
            <input type="text" id="name" placeholder="Your name" value="${escapeHtml(user.name || '')}" />
            <span class="error" id="err-name"></span>
          </div>
          <div class="form-group">
            <label for="phone">Phone *</label>
            <input type="tel" id="phone" placeholder="+91 55555 55555" value="${escapeHtml(user.phone || '')}" />
            <span class="error" id="err-phone"></span>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="you@example.com" value="${escapeHtml(user.email || '')}" />
          </div>
          <div class="form-group">
            <label for="address">Delivery Address *</label>
            <textarea id="address" placeholder="Street, City, Zip"></textarea>
            <span class="error" id="err-address"></span>
          </div>
        </div>

        <!-- Payment method -->
        <div class="checkout-section">
          <h3>💳 Payment Method</h3>
          <div class="payment-options">
            <div class="payment-option ${selectedPayment === 'cash' ? 'selected' : ''}" data-method="cash">
              <label><input type="radio" name="payment" value="cash" ${selectedPayment === 'cash' ? 'checked' : ''} /> 💵 Cash on Delivery</label>
              <div class="sub">Pay when your plants arrive.</div>
            </div>
            <div class="payment-option ${selectedPayment === 'upi' ? 'selected' : ''}" data-method="upi">
              <label><input type="radio" name="payment" value="upi" ${selectedPayment === 'upi' ? 'checked' : ''} /> 📱 UPI Payment</label>
              <div class="sub">Scan the QR code to pay instantly.</div>
              <div class="upi-qr" id="upi-qr" style="${selectedPayment === 'upi' ? '' : 'display:none'}">
                <img src="${makeQrDataUrl(UPI_PAY_DATA)}" alt="UPI QR Code" />
                <p style="font-size:0.85rem;color:var(--text-light);margin-top:0.4rem">Scan with any UPI app (GPay, PhonePe, Paytm)</p>
                <p style="font-size:0.85rem;color:var(--text-light);margin-top:0.4rem">Pay to: <strong>${UPI_ID}</strong></p>
              </div>
            </div>
            <div class="payment-option ${selectedPayment === 'card' ? 'selected' : ''}" data-method="card">
              <label><input type="radio" name="payment" value="card" ${selectedPayment === 'card' ? 'checked' : ''} /> 💳 Card Payment</label>
              <div class="sub">Visa, Mastercard, Amex (simulated).</div>
              <div class="card-fields" id="card-fields" style="${selectedPayment === 'card' ? '' : 'display:none'}">
                <div class="form-group full">
                  <label>Card Number</label>
                  <input type="text" id="card_number" placeholder="1234 5678 9012 3456" maxlength="19" />
                </div>
                <div class="form-group">
                  <label>Expiry</label>
                  <input type="text" id="card_expiry" placeholder="MM/YY" maxlength="5" />
                </div>
                <div class="form-group">
                  <label>CVV</label>
                  <input type="password" id="card_cvv" placeholder="123" maxlength="4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button class="btn btn-block" id="place-order" style="font-size:1.1rem;padding:0.9rem">Place Order</button>
      </div>

      <!-- Order summary -->
      <div>
        <div class="checkout-section">
          <h3>🧾 Order Summary</h3>
          ${cart.map((item) => `
            <div class="row" style="display:flex;justify-content:space-between;margin-bottom:0.5rem;font-size:0.9rem">
              <span>${item.name} × ${item.quantity}</span>
              <span>${formatPrice(item.price * item.quantity)}</span>
            </div>
          `).join("")}
          <div class="total" style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border);font-size:1.3rem;font-weight:700;color:var(--primary-dark)">
            Total: ${formatPrice(cartTotal())}
          </div>
        </div>
      </div>
    </div>
  `;

  // Wire up payment option selection
  document.querySelectorAll(".payment-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      selectedPayment = opt.dataset.method;
      document.querySelectorAll(".payment-option").forEach((o) => o.classList.remove("selected"));
      opt.classList.add("selected");
      opt.querySelector("input").checked = true;
      document.getElementById("upi-qr").style.display = selectedPayment === "upi" ? "" : "none";
      document.getElementById("card-fields").style.display = selectedPayment === "card" ? "" : "none";
    });
  });

  document.getElementById("place-order").addEventListener("click", submitOrder);
}

function validate() {
  let valid = true;
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  document.getElementById("err-name").textContent = "";
  document.getElementById("err-phone").textContent = "";
  document.getElementById("err-address").textContent = "";

  if (!name) { document.getElementById("err-name").textContent = "Name is required."; valid = false; }
  if (!phone || phone.length < 7) { document.getElementById("err-phone").textContent = "Valid phone is required."; valid = false; }
  if (!address) { document.getElementById("err-address").textContent = "Address is required."; valid = false; }

  if (selectedPayment === "card") {
    const cardNum = document.getElementById("card_number").value.replace(/\s/g, "");
    const exp = document.getElementById("card_expiry").value.trim();
    const cvv = document.getElementById("card_cvv").value.trim();
    if (cardNum.length < 12 || exp.length < 4 || cvv.length < 3) {
      alert("Please enter valid card details (simulated).");
      valid = false;
    }
  }
  return valid;
}

async function submitOrder() {
  if (!validate()) return;

  const cart = getCart();
  const items = cart.map((item) => ({
    product_id: item.product_id,
    quantity: item.quantity,
  }));

  const orderData = {
    customer_name: document.getElementById("name").value.trim(),
    customer_phone: document.getElementById("phone").value.trim(),
    customer_email: document.getElementById("email").value.trim(),
    address: document.getElementById("address").value.trim(),
    payment_method: selectedPayment,
    items,
  };

  const btn = document.getElementById("place-order");
  btn.disabled = true;
  btn.textContent = "Processing...";

  try {
    const result = await API.createOrder(orderData, getAuthToken());
    if (result.success) {
      clearCart();
      const container = document.getElementById("checkout-container");
      container.innerHTML = `
        <div class="empty">
          <h2>🎉 Order Placed Successfully!</h2>
          <p>Order ID: <strong>#${result.order_id}</strong></p>
          <p>Total: <strong>${formatPrice(result.total_amount)}</strong></p>
          <p>Payment Method: <strong>${selectedPayment.toUpperCase()}</strong></p>
<p style="margin-top:0.5rem">${selectedPayment === 'upi' ? 'Please complete the UPI payment by scanning the QR code.' : 'We will contact you to confirm your order.'}</p>
          <div style="display:flex;gap:0.5rem;justify-content:center;margin-top:1rem;flex-wrap:wrap">
            <a href="orders.html" class="btn">📦 Track My Order</a>
            <a href="products.html" class="btn btn-outline">Continue Shopping</a>
          </div>
        </div>`;
    } else {
      alert(result.error || "Could not place order.");
      btn.disabled = false;
      btn.textContent = "Place Order";
    }
  } catch (e) {
    alert("Network error. Please try again.");
    btn.disabled = false;
    btn.textContent = "Place Order";
  }
}

document.addEventListener("DOMContentLoaded", renderCheckout);
