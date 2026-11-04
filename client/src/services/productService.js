// client/src/services/productService.js

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function fetchProducts(category = "All") {
  try {
    const url =
      category && category !== "All"
        ? `${API_BASE_URL}/products?category=${encodeURIComponent(category)}`
        : `${API_BASE_URL}/products`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch store items (Status: ${response.status})`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error connecting to products API:", error);
    throw error;
  }
}
