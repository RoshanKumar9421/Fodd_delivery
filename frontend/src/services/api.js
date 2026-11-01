import axios from "axios";

export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://127.0.0.1:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Checks FastAPI backend health status
 */
export async function checkBackendHealth() {
  try {
    const res = await apiClient.get("/");
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Submits delivery time prediction request
 */
export async function predictDeliveryTime(payload) {
  const response = await apiClient.post("/predict", payload);
  return response.data;
}

/**
 * Raw geocode lookup for a single query string using Photon and Nominatim
 */
async function rawSearch(query) {
  if (!query || query.trim().length < 2) return [];
  const cleanQuery = query.trim();

  // Try Photon
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      cleanQuery
    )}&limit=6`;
    const res = await axios.get(photonUrl, { timeout: 6000 });

    if (res.data?.features && res.data.features.length > 0) {
      return res.data.features.map((item, idx) => {
        const props = item.properties || {};
        const coords = item.geometry?.coordinates || [0, 0];
        const title = props.name || props.street || cleanQuery;
        const details = [
          props.district,
          props.city || props.county,
          props.state,
          props.country,
        ]
          .filter(Boolean)
          .join(", ");

        return {
          id: `photon-${idx}-${props.osm_id || Math.random()}`,
          name: title,
          fullAddress: details ? `${title}, ${details}` : title,
          latitude: Number(coords[1]),
          longitude: Number(coords[0]),
          city: props.city || props.district || "",
        };
      });
    }
  } catch (err) {
    console.warn("Photon lookup failed, trying fallback:", err.message);
  }

  // Fallback: Nominatim
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      cleanQuery
    )}&addressdetails=1&limit=5`;
    const res = await axios.get(nomUrl, {
      timeout: 6000,
      headers: {
        "Accept-Language": "en",
        "User-Agent": "FoodDeliveryApp/1.0 (contact@fooddelivery.local)",
      },
    });

    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((item) => ({
        id: `nom-${item.place_id}`,
        name: item.name || item.display_name.split(",")[0],
        fullAddress: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        city:
          item.address?.city ||
          item.address?.town ||
          item.address?.suburb ||
          "",
      }));
    }
  } catch (fallbackErr) {
    console.warn("Nominatim lookup failed:", fallbackErr.message);
  }

  return [];
}

/**
 * Strips internal unit/flat/floor/shop noise that geocoders cannot index
 */
function stripInternalUnitNoise(str) {
  return str
    .replace(
      /\b(gr(ound)?\s*fl(oo)?r|basement|first\s*floor|second\s*floor|\d+(st|nd|rd|th)?\s*fl(oo)?r)\b/gi,
      ""
    )
    .replace(
      /\b(unit|flat|shop|room|plot|house|building|block|door|suite|no\.?|near|opp\.?|behind)\s*[:#\-]?\s*[\w&/\-]+/gi,
      ""
    )
    .replace(/\b\d+&\d+\b/g, "")
    .replace(/\s+/g, " ")
    .replace(/,\s*,+/g, ",")
    .replace(/^[\s,]+|[\s,]+$/g, "");
}

/**
 * Generates progressive fallback search queries for long, complex addresses
 */
function generateFallbackQueries(rawQuery) {
  const candidates = [];
  const cleaned = stripInternalUnitNoise(rawQuery);
  if (cleaned && cleaned !== rawQuery && cleaned.length >= 3) {
    candidates.push(cleaned);
  }

  const parts = rawQuery
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const cleanParts = cleaned
    ? cleaned
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Drop progressive leading tokens (where floor/unit numbers usually sit)
  for (let i = 1; i < parts.length - 1; i++) {
    const sub = parts.slice(i).join(", ");
    if (!candidates.includes(sub)) candidates.push(sub);
  }
  for (let i = 1; i < cleanParts.length - 1; i++) {
    const sub = cleanParts.slice(i).join(", ");
    if (!candidates.includes(sub)) candidates.push(sub);
  }

  // Landmark + City / State
  if (parts.length >= 3) {
    const landmarkCity = `${parts[0]}, ${parts.slice(-2).join(", ")}`;
    if (!candidates.includes(landmarkCity)) candidates.push(landmarkCity);
    const landmarkCityShort = `${parts[0]}, ${parts[parts.length - 2]}`;
    if (!candidates.includes(landmarkCityShort)) candidates.push(landmarkCityShort);
  }

  // Postal code / Pincode
  const pinMatch = rawQuery.match(/\b\d{5,6}\b/);
  if (pinMatch) {
    if (parts.length >= 2) {
      const cityPin = `${parts[parts.length - 2]} ${pinMatch[0]}`;
      if (!candidates.includes(cityPin)) candidates.push(cityPin);
    }
    if (!candidates.includes(pinMatch[0])) candidates.push(pinMatch[0]);
  }

  return candidates;
}

/**
 * Search places and addresses with progressive fallback handling for detailed addresses
 */
export async function searchAddress(query, allowFallbacks = true) {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim();

  // 1. Direct search
  const directResults = await rawSearch(cleanQuery);
  if (directResults.length > 0) {
    return directResults;
  }

  if (!allowFallbacks) return [];

  // 2. Intelligent progressive fallbacks for detailed/complex addresses
  const fallbacks = generateFallbackQueries(cleanQuery);
  for (const fb of fallbacks) {
    const fbResults = await rawSearch(fb);
    if (fbResults.length > 0) {
      return fbResults;
    }
  }

  return [];
}

/**
 * Reverse geocodes coordinates to an address
 */
export async function reverseGeocode(lat, lon) {
  // 1. Try Photon reverse geocoding
  try {
    const photonUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
    const res = await axios.get(photonUrl, { timeout: 5000 });
    const feat = res.data?.features?.[0];
    if (feat) {
      const p = feat.properties || {};
      const title =
        p.name ||
        p.street ||
        `Location (${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)})`;
      const details = [p.district, p.city || p.county, p.state, p.country]
        .filter(Boolean)
        .join(", ");
      return {
        name: title,
        fullAddress: details ? `${title}, ${details}` : title,
      };
    }
  } catch (err) {
    console.warn("Photon reverse geocode failed, trying fallback:", err.message);
  }

  // 2. Fallback: Nominatim reverse geocode
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await axios.get(url, {
      timeout: 5000,
      headers: { "Accept-Language": "en" },
    });
    if (res.data?.display_name) {
      return {
        name: res.data.name || res.data.display_name.split(",")[0],
        fullAddress: res.data.display_name,
      };
    }
  } catch (e) {
    console.warn("Nominatim reverse geocode failed:", e.message);
  }

  return {
    name: `Location (${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)})`,
    fullAddress: `Lat: ${Number(lat).toFixed(4)}, Lon: ${Number(lon).toFixed(4)}`,
  };
}

/**
 * Geocodes a manually entered address or coordinate string into a resolved location object.
 * Supports:
 *  1. Raw coordinates (e.g. "28.6139, 77.2090" or "12.9716 77.5946" or "lat: 12.9716, lon: 77.5946")
 *  2. Manual text address via Photon / Nominatim searchAddress()
 */
export async function geocodeManualAddress(query) {
  if (!query || typeof query !== "string") {
    return { ok: false, error: "Empty address" };
  }

  const clean = query.trim();
  if (clean.length < 2) {
    return { ok: false, error: "Address too short" };
  }

  // 1. Check for coordinates format e.g. "28.6139, 77.2090" or "28.6139 77.2090" or "lat: 28.6139, lon: 77.2090"
  const cleanedCoords = clean
    .replace(/lat(itude)?[:=]?\s*/gi, "")
    .replace(/lon(gitude)?[:=]?\s*/gi, "");
  const coordMatch = cleanedCoords.match(
    /^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/
  );
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[2]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      const rev = await reverseGeocode(lat, lon);
      return {
        ok: true,
        data: {
          name: rev?.name || `Coords (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
          fullAddress:
            rev?.fullAddress || `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`,
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lon.toFixed(6)),
          city: "",
          verified: true,
          isManual: true,
        },
      };
    }
  }

  // 2. Geocode address text with progressive fallback matching
  const results = await searchAddress(clean, true);
  if (results && results.length > 0) {
    const top = results[0];
    const shortTitle =
      clean.length > 45 ? clean.split(",")[0].trim() || top.name : clean;
    return {
      ok: true,
      data: {
        name: shortTitle,
        fullAddress: clean,
        latitude: top.latitude,
        longitude: top.longitude,
        city: top.city || "",
        verified: true,
        isManual: true,
        matchedLocation: top.fullAddress || top.name,
      },
    };
  }

  return { ok: false, error: `Could not find coordinates for "${clean}"` };
}

/**
 * Calculate Haversine distance in km
 */
export function calculateHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180.0;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180.0) *
      Math.cos((lat2 * Math.PI) / 180.0) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Fetches real road route geometry from OSRM
 */
export async function fetchRoute(startLat, startLon, endLat, endLon) {
  // Validate coordinates
  if (
    !startLat ||
    !startLon ||
    !endLat ||
    !endLon ||
    isNaN(startLat) ||
    isNaN(startLon) ||
    isNaN(endLat) ||
    isNaN(endLon)
  ) {
    return null;
  }

  const haversineDist = calculateHaversine(startLat, startLon, endLat, endLon);

  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;
    const res = await axios.get(osrmUrl, { timeout: 8000 });

    if (res.data?.code === "Ok" && res.data.routes?.length > 0) {
      const route = res.data.routes[0];
      // Convert [lon, lat] coordinates to Leaflet [lat, lon]
      const latLngs = route.geometry.coordinates.map((coord) => [
        coord[1],
        coord[0],
      ]);

      const distanceKm = Number((route.distance / 1000).toFixed(2));
      const durationMin = Math.round(route.duration / 60);

      return {
        isRealRoad: true,
        coordinates: latLngs,
        distanceKm: distanceKm || haversineDist,
        durationMin,
        haversineKm: haversineDist,
      };
    }
  } catch (err) {
    console.warn("OSRM routing unavailable, generating road path fallback:", err.message);
  }

  // Fallback: smooth interpolated geodesic line between points
  const points = [];
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    const lat = startLat + (endLat - startLat) * fraction;
    const lon = startLon + (endLon - startLon) * fraction;
    points.push([lat, lon]);
  }

  return {
    isRealRoad: false,
    coordinates: points,
    distanceKm: haversineDist,
    durationMin: Math.round(haversineDist * 3), // rough ~20km/h city estimate
    haversineKm: haversineDist,
  };
}
