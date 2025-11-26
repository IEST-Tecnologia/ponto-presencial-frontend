export const CENTER_LAT = parseFloat(process.env.NEXT_PUBLIC_CENTER_LAT || "0");
export const CENTER_LNG = parseFloat(process.env.NEXT_PUBLIC_CENTER_LNG || "0");
export const RADIUS = parseFloat(process.env.NEXT_PUBLIC_RADIUS || "100");

// Calculate distance between two coordinates using Haversine formula
export function getDistanceInMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface LocationCheckResult {
  isInside: boolean;
  distance: number;
  effectiveDistance: number;
}

// Check if user is within radius considering accuracy
export function isWithinRadius(
  userLat: number,
  userLng: number,
  accuracy: number
): LocationCheckResult {
  const distance = getDistanceInMeters(
    userLat,
    userLng,
    CENTER_LAT,
    CENTER_LNG
  );
  // Consider the worst case: user could be at the edge of accuracy circle furthest from center
  const effectiveDistance = distance;
  const isInside = effectiveDistance <= RADIUS + accuracy;
  return { isInside, distance, effectiveDistance };
}
