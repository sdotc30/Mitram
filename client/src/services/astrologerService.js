const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function fetchAstrologers(categoryCode = "") {
  try {
    const url = categoryCode
      ? `${API_BASE_URL}/astrologers?category=${encodeURIComponent(categoryCode)}`
      : `${API_BASE_URL}/astrologers`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch astrologers (Status: ${response.status})`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error connecting to astrologers API:", error);
    throw error;
  }
}
