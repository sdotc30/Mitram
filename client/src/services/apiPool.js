// client/src/services/apiPool.js

// Retrieve Vite environment variables
const API_KEY_POOL = [
  import.meta.env.VITE_NAVAMSHA_API_KEY,
  import.meta.env.VITE_PROKERALA_CLIENT_ID,
  import.meta.env.VITE_FREEASTROLOGY_API_KEY,
].filter(Boolean);

// Memory tracker for exhausted keys during the user session
const exhaustedKeys = new Set();

function getAvailableKey() {
  const activeKeys = API_KEY_POOL.filter((key) => !exhaustedKeys.has(key));
  return activeKeys.length > 0 ? activeKeys[0] : null;
}

/**
 * Rotates through the key pool if a provider returns HTTP 429 (Rate Limit) or 403 (Quota Exceeded)
 */
export async function fetchWithPool(endpointBuilderFn) {
  let attempts = 0;
  const maxAttempts = API_KEY_POOL.length;

  if (maxAttempts === 0) {
    throw new Error("NO_KEYS_CONFIGURED");
  }

  while (attempts < maxAttempts) {
    const currentKey = getAvailableKey();

    if (!currentKey) {
      throw new Error("ALL_KEYS_EXHAUSTED");
    }

    try {
      const url = endpointBuilderFn(currentKey);
      const response = await fetch(url);

      if (response.status === 429 || response.status === 403) {
        console.warn(
          `Key ...${currentKey.slice(-4)} exhausted (HTTP ${response.status}). Rotating key.`,
        );
        exhaustedKeys.add(currentKey);
        attempts++;
        continue;
      }

      if (!response.ok) {
        throw new Error(`API HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      if (
        err.message === "ALL_KEYS_EXHAUSTED" ||
        err.message === "NO_KEYS_CONFIGURED"
      ) {
        throw err;
      }
      console.warn("Network error during pool fetch, trying next key:", err);
      exhaustedKeys.add(currentKey);
      attempts++;
    }
  }

  throw new Error("ALL_KEYS_EXHAUSTED");
}

export function resetKeyPool() {
  exhaustedKeys.clear();
}
