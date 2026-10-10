// client/src/services/chartCache.js

const IN_MEMORY_CACHE = new Map();

/**
 * Unique key built from immutable user birth details
 */
export function generateCacheKey(birthDetails) {
  const { fullName, dob, timeOfBirth, placeOfBirth } = birthDetails;
  const cleanName = (fullName || "user").toLowerCase().trim();
  const cleanPlace = (placeOfBirth || "delhi").toLowerCase().trim();
  return `mitram_kundli_${cleanName}_${dob}_${timeOfBirth}_${cleanPlace}`;
}

export function getCachedChartData(birthDetails) {
  const cacheKey = generateCacheKey(birthDetails);

  // 1. In-Memory JS Map (0ms)
  if (IN_MEMORY_CACHE.has(cacheKey)) {
    console.log("⚡ Served Kundli from In-Memory Cache");
    return IN_MEMORY_CACHE.get(cacheKey);
  }

  // 2. LocalStorage (Persistent across refreshes)
  try {
    const localData = localStorage.getItem(cacheKey);
    if (localData) {
      const parsed = JSON.parse(localData);
      IN_MEMORY_CACHE.set(cacheKey, parsed);
      console.log("💾 Served Kundli from localStorage Cache");
      return parsed;
    }
  } catch (err) {
    console.error("Error reading from localStorage cache:", err);
  }

  return null;
}

export function saveChartDataToCache(birthDetails, apiResponseData) {
  const cacheKey = generateCacheKey(birthDetails);
  IN_MEMORY_CACHE.set(cacheKey, apiResponseData);

  try {
    localStorage.setItem(cacheKey, JSON.stringify(apiResponseData));
    console.log("✅ Kundli response successfully cached");
  } catch (err) {
    console.error("Error writing to localStorage cache:", err);
  }
}
