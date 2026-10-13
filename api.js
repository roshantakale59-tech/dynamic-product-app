
const API_URL = "https://fakestoreapi.com/products";

async function fetchProductsFromAPI() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`Server returned HTTP ${response.status}`);
  }

  return await response.json();
}
