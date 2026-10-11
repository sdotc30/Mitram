// client/src/services/apiPool.js

const NAVAMSHA_KEY = import.meta.env.VITE_NAVAMSHA_API_KEY;
const PROKERALA_CLIENT_ID = import.meta.env.VITE_PROKERALA_CLIENT_ID;
const PROKERALA_CLIENT_SECRET = import.meta.env.VITE_PROKERALA_CLIENT_SECRET;

const exhaustedKeys = new Set();

/**
 * Executes requests against Navamsha API using key pool rotation
 */
export async function fetchFromNavamshaPool(endpointPath, payload) {
  if (!NAVAMSHA_KEY) {
    throw new Error("NO_NAVAMSHA_KEY_CONFIGURED");
  }

  if (exhaustedKeys.has(NAVAMSHA_KEY)) {
    throw new Error("NAVAMSHA_KEY_EXHAUSTED");
  }

  try {
    const response = await fetch(`https://api.navamsha.in${endpointPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NAVAMSHA_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 429 || response.status === 403) {
      exhaustedKeys.add(NAVAMSHA_KEY);
      throw new Error(`Navamsha HTTP Error: ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(`Navamsha API HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    throw err;
  }
}

export function resetKeyPool() {
  exhaustedKeys.clear();
}
