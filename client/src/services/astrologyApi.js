// client/src/services/astrologyApi.js

import { getCachedChartData, saveChartDataToCache } from "./chartCache";
import { fetchWithPool } from "./apiPool";

/**
 * Free Nominatim Geocoding lookup
 */
export async function getCoordinates(cityName) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`,
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
    return { lat: 28.6139, lon: 77.209 }; // Default: New Delhi
  } catch (e) {
    console.error("Geocoding lookup error:", e);
    return { lat: 28.6139, lon: 77.209 };
  }
}

/**
 * Fetch Kundli with Cache -> Key Pool -> Public Backup
 */
export async function fetchKundliData(birthDetails) {
  // 1. Check Cache
  const cachedData = getCachedChartData(birthDetails);
  if (cachedData) {
    return cachedData;
  }

  console.log("🌐 Cache Miss. Initializing live fetch...");

  const { dob, timeOfBirth, placeOfBirth } = birthDetails;
  const [year, month, day] = dob.split("-");
  const [hours, minutes] = timeOfBirth ? timeOfBirth.split(":") : ["12", "00"];
  const coords = await getCoordinates(placeOfBirth);

  try {
    // 2. Attempt Key Pool Call
    const apiResponse = await fetchWithPool((apiKey) => {
      const params = new URLSearchParams({
        api_key: apiKey,
        dob: `${day}/${month}/${year}`,
        tob: `${hours}:${minutes}`,
        lat: coords.lat,
        lon: coords.lon,
        tz: 5.5,
        lang: "en",
      });
      return `https://api.vedicastroapi.com/v3-json/horoscope/planet-details?${params}`;
    });

    saveChartDataToCache(birthDetails, apiResponse);
    return apiResponse;
  } catch (poolError) {
    console.warn("Key pool depleted. Switching to backup endpoint...");

    // 3. Fallback to Zero-Key Backup Endpoint
    try {
      const backupUrl =
        import.meta.env.VITE_PUBLIC_BACKUP_URL ||
        "https://kundlidost-api-833851802975.asia-south1.run.app";
      const backupRes = await fetch(`${backupUrl}/api/doshas/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: birthDetails.fullName || "User",
          birth: {
            date: dob,
            time: `${hours}:${minutes}`,
            lat: coords.lat,
            lng: coords.lon,
            place: placeOfBirth,
          },
        }),
      });

      const backupData = await backupRes.json();
      const formattedBackup = { source: "public_backup", response: backupData };

      saveChartDataToCache(birthDetails, formattedBackup);
      return formattedBackup;
    } catch (backupError) {
      console.error("All endpoints failed:", backupError);
      throw new Error("Unable to generate live chart at this moment.");
    }
  }
}
