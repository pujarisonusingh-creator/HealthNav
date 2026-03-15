import { Hospital } from "../types";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function parseTags(
  tags: Record<string, string>,
  lat: number,
  lng: number,
  userLat: number,
  userLng: number,
  id: string
): Hospital {
  const distKm = haversineDistance(userLat, userLng, lat, lng);
  const name = tags["name"] || tags["name:en"] || tags["name:te"] || "Hospital";

  const addrParts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"] || tags["addr:town"],
  ].filter(Boolean);
  const address = addrParts.join(", ") || tags["description"] || "";

  const amenity = tags["amenity"] || tags["healthcare"] || "";
  const type: Hospital["type"] =
    amenity === "hospital" || amenity === "hospital"
      ? "hospital"
      : amenity === "clinic"
      ? "clinic"
      : "emergency";

  const hasICU = !!(
    tags["healthcare:speciality"]?.includes("intensive") ||
    tags["icu"] === "yes" ||
    tags["healthcare:speciality"]?.includes("cardiology")
  );
  const hasOxygen = !!(tags["oxygen"] === "yes" || tags["medical_supply:oxygen"] === "yes");
  const hasAmbulance = !!(
    tags["ambulance"] === "yes" ||
    tags["emergency"] === "ambulance_station" ||
    tags["healthcare:speciality"]?.includes("emergency")
  );
  const is247 = !!(
    tags["opening_hours"] === "24/7" ||
    tags["emergency"] === "yes" ||
    tags["amenity"] === "hospital"
  );
  const hasPharmacy = !!(
    tags["pharmacy"] === "yes" ||
    tags["healthcare:speciality"]?.includes("pharmacy")
  );
  const hasBloodBank = !!(
    tags["blood_bank"] === "yes" ||
    tags["healthcare:speciality"]?.includes("blood")
  );
  const hasTrauma = !!(
    tags["trauma"] === "yes" ||
    tags["healthcare:speciality"]?.includes("trauma") ||
    tags["healthcare:speciality"]?.includes("surgery")
  );
  const hasPediatric = !!(
    tags["healthcare:speciality"]?.includes("pediatric") ||
    tags["healthcare:speciality"]?.includes("paediatric") ||
    tags["healthcare:speciality"]?.includes("children")
  );

  return {
    id: `osm-${id}`,
    name,
    address,
    lat,
    lng,
    phone: tags["phone"] || tags["contact:phone"] || tags["contact:mobile"] || undefined,
    website: tags["website"] || tags["contact:website"] || undefined,
    distance: formatDistance(distKm),
    distanceKm: distKm,
    type,
    mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    facilities: {
      icu: hasICU,
      oxygen: hasOxygen,
      ambulance: hasAmbulance,
      emergency247: is247,
      pharmacy: hasPharmacy,
      bloodBank: hasBloodBank,
      trauma: hasTrauma,
      pediatric: hasPediatric,
    },
  };
}

async function queryOverpass(lat: number, lng: number, radiusMeters: number): Promise<Hospital[]> {
  const query = `
    [out:json][timeout:30];
    (
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      relation["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      way["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      node["healthcare"="hospital"](around:${radiusMeters},${lat},${lng});
      way["healthcare"="hospital"](around:${radiusMeters},${lat},${lng});
      node["healthcare"="clinic"](around:${radiusMeters},${lat},${lng});
      node["emergency"="yes"](around:${radiusMeters},${lat},${lng});
    );
    out center tags;
  `;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(18000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const elements: any[] = data.elements || [];

      const seen = new Set<string>();
      const hospitals: Hospital[] = [];

      for (const el of elements) {
        const elLat = el.lat ?? el.center?.lat;
        const elLng = el.lon ?? el.center?.lon;
        if (!elLat || !elLng) continue;
        const nameKey = (el.tags?.name || "").toLowerCase().trim();
        if (nameKey && seen.has(nameKey)) continue;
        if (nameKey) seen.add(nameKey);
        hospitals.push(parseTags(el.tags || {}, elLat, elLng, lat, lng, String(el.id)));
      }

      return hospitals.sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
    } catch (err) {
      console.warn(`Overpass endpoint failed (${endpoint}):`, err);
    }
  }
  return [];
}

export class HospitalService {
  async findNearbyHospitals(lat: number, lng: number): Promise<Hospital[]> {
    try {
      let hospitals = await queryOverpass(lat, lng, 5000);
      if (hospitals.length < 5) hospitals = await queryOverpass(lat, lng, 12000);
      if (hospitals.length < 3) hospitals = await queryOverpass(lat, lng, 25000);
      return hospitals.slice(0, 30);
    } catch (error) {
      console.error("Overpass error:", error);
      return this.getMockHospitals(lat, lng);
    }
  }

  private getMockHospitals(lat: number, lng: number): Hospital[] {
    return [
      {
        id: "mock-1",
        name: "City Central Hospital",
        address: "123 Healthcare Ave, Downtown",
        lat: lat + 0.005, lng: lng + 0.005,
        distance: "0.8 km", distanceKm: 0.8,
        type: "hospital",
        mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat + 0.005},${lng + 0.005}`,
        facilities: { icu: true, oxygen: true, ambulance: true, emergency247: true, pharmacy: true, bloodBank: false, trauma: true, pediatric: false },
      },
      {
        id: "mock-2",
        name: "Emergency Care Clinic",
        address: "45 Rescue St, North District",
        lat: lat - 0.008, lng: lng + 0.002,
        distance: "1.2 km", distanceKm: 1.2,
        type: "clinic",
        mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat - 0.008},${lng + 0.002}`,
        facilities: { icu: false, oxygen: true, ambulance: true, emergency247: true, pharmacy: true, bloodBank: false, trauma: false, pediatric: true },
      },
    ];
  }

  async generateVisual(_prompt: string): Promise<string | null> { return null; }
}
