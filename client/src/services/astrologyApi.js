// client/src/services/astrologyApi.js

import { getCachedChartData, saveChartDataToCache } from "./chartCache";

const NAVAMSHA_KEY = import.meta.env.VITE_NAVAMSHA_API_KEY;

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
 * Fetch Live Kundli Data from Navamsha API via Vite Proxy
 */
export async function fetchKundliData(birthDetails) {
  // 1. Check Local Cache First (0ms response)
  const cachedData = getCachedChartData(birthDetails);
  if (cachedData) {
    console.log("💾 Served Kundli from local cache");
    return cachedData;
  }

  const { dob, timeOfBirth, placeOfBirth } = birthDetails;
  const [year, month, day] = dob.split("-");
  const [hours, minutes] = timeOfBirth ? timeOfBirth.split(":") : ["12", "00"];
  const coords = await getCoordinates(placeOfBirth);

  const payload = {
    year: parseInt(year, 10),
    month: parseInt(month, 10),
    date: parseInt(day, 10),
    hours: parseInt(hours, 10),
    minutes: parseInt(minutes, 10),
    seconds: 0,
    latitude: coords.lat,
    longitude: coords.lon,
    timezone: 5.5,
  };

  console.log("🌐 Fetching live chart from Navamsha API...");
  const response = await fetch("/api/v1/kundali/basic", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NAVAMSHA_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Navamsha Error (${response.status}): ${responseText}`);
  }

  const apiResponse = JSON.parse(responseText);
  saveChartDataToCache(birthDetails, apiResponse);
  return apiResponse;
}
