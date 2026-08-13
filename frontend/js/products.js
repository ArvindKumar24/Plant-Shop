/**
 * products.js - Product listing with search and filters.
 */

const grid = document.getElementById("product-grid");
const countEl = document.getElementById("result-count");

/** Render a list of products into the grid. */
function renderProducts(products) {
  if (!products.length) {
    grid.innerHTML = `<div class="empty"><h2>No plants found</h2><p>Try adjusting your search or filters.</p></div>`;
    countEl.textContent = "0 products";
    return;
  }
  grid.innerHTML = products.map((p) => `
    <div class="product-card">
      <a href="product.html?id=${p.id}">
        <div class="img-wrap"><img src="${productImage(p)}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300/4caf50/ffffff?text=Plant';this.classList.add('no-img')"></div>
      </a>
      <div class="product-body">
        <span class="badge ${p.category}">${p.category}</span>
        <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <div class="price">${formatPrice(p.price)}</div>
        <p class="desc">${p.description || ''}</p>
<div class="product-actions">
          <button class="btn" ${p.stock <= 0 ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ""} onclick="addToCartById(${p.id}, 1)">${p.stock <= 0 ? "Out of Stock" : "Add to Cart"}</button>
          <a href="product.html?id=${p.id}" class="btn btn-outline">View</a>
        </div>
      </div>
    </div>
  `).join("");
  countEl.textContent = `${products.length} product${products.length > 1 ? "s" : ""}`;
}

/** Load products from the API using current filter state. */
async function loadProducts() {
  const params = {
    search: document.getElementById("search").value.trim(),
    category: document.getElementById("category").value,
    plant_type: document.getElementById("plant_type").value,
    min_price: document.getElementById("min_price").value,
    max_price: document.getElementById("max_price").value,
  };
  try {
const data = await API.getProducts(params);
    registerProducts(data.products || []);
    renderProducts(data.products || []);
  } catch (e) {
    grid.innerHTML = `<div class="empty"><h2>Could not load products</h2><p>Please check the server and database.</p></div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Read initial category from URL query param (e.g. products.html?category=indoor)
  const params = new URLSearchParams(window.location.search);
  const cat = params.get("category");
  if (cat) document.getElementById("category").value = cat;

  document.getElementById("apply-filters").addEventListener("click", loadProducts);
  document.getElementById("clear-filters").addEventListener("click", () => {
    document.getElementById("search").value = "";
    document.getElementById("category").value = "";
    document.getElementById("plant_type").value = "";
    document.getElementById("min_price").value = "";
    document.getElementById("max_price").value = "";
    loadProducts();
  });
  // Live search on typing (debounced)
  let timer;
  document.getElementById("search").addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(loadProducts, 400);
  });

  loadProducts();
});
