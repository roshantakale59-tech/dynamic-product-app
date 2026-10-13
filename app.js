
/* Main application entry point */

// Application State
let rawProducts = [];
let currentSearch = "";
let currentCategory = "all";

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// DOM References
const elements = {
  productsGrid: document.getElementById("products"),
  searchInput: document.getElementById("searchInput"),
  categoryButtons: document.querySelectorAll(".category-btn"),
  errorBanner: document.getElementById("error-banner")
};

async function fetchProducts() {
  showSkeletonLoading();
  hideError();

  try {
    rawProducts = await fetchProductsFromAPI();
    applyFilters();
  } catch (error) {
    console.error("Product loading error:", error);
    showError(
      "Failed to load products. Check your internet connection."
    );
    elements.productsGrid.innerHTML = "";
  }
}

function displayProducts(productsList) {
  if (productsList.length === 0) {
    elements.productsGrid.innerHTML =
      '<p class="no-results">No matching products found.</p>';
    return;
  }

  elements.productsGrid.innerHTML = productsList
    .map(product => `
      <article class="product-card">
        <img src="${product.image}"
             alt="${product.title}"
             loading="lazy">
        <div>
          <h3 class="product-title">${product.title}</h3>
          <p class="product-price">$${product.price.toFixed(2)}</p>
          <button class="add-to-cart-btn"
                  data-product-id="${product.id}">
            Add to Cart
          </button>
        </div>
      </article>
    `).join("");

  elements.productsGrid
    .querySelectorAll(".add-to-cart-btn")
    .forEach(button => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.productId);
        const product = rawProducts.find(item => item.id === id);

        if (!product) return;

        const alreadyInCart = cart.some(item => item.id === id);

        if (!alreadyInCart) {
          cart.push(product);
          saveCart();
        }

        button.textContent = alreadyInCart
          ? "Already Added"
          : "Added!";
        button.disabled = true;
      });
    });
}

function applyFilters() {
  const searchText = currentSearch.toLowerCase().trim();

  let filtered = rawProducts.filter(product => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchText);

    const matchesCategory =
      currentCategory === "all" ||
      product.category.toLowerCase().trim() ===
      currentCategory.toLowerCase().trim();

    return matchesSearch && matchesCategory;
  });

  const sortSelect = document.getElementById("sortSelect");
  const sortValue = sortSelect ? sortSelect.value : "default";

  if (sortValue === "low-high") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortValue === "high-low") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortValue === "az") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  displayProducts(filtered);
}

function showSkeletonLoading() {
  elements.productsGrid.innerHTML = Array(8)
    .fill(0)
    .map(() => `
      <div class="skeleton-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
      </div>
    `).join("");
}

function showError(message) {
  elements.errorBanner.textContent = message;
  elements.errorBanner.classList.remove("hidden");
}

function hideError() {
  elements.errorBanner.textContent = "";
  elements.errorBanner.classList.add("hidden");
}

function initEventListeners() {
  if (elements.searchInput) {
    elements.searchInput.addEventListener("input", event => {
      currentSearch = event.target.value;
      applyFilters();
    });
  }

  const sortSelect = document.getElementById("sortSelect");

  if (sortSelect) {
    sortSelect.addEventListener("change", applyFilters);
  }

  elements.categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      currentCategory = button.dataset.category;

      elements.categoryButtons.forEach(btn =>
        btn.classList.remove("active")
      );
      button.classList.add("active");

      applyFilters();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initEventListeners();
  fetchProducts();
});
