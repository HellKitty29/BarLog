export function toLatLngParams(coords?: { lat?: number; lng?: number }) {
  return {
    lat: coords?.lat,
    lng: coords?.lng
  };
}

const earthRadiusMeters = 6371000;
const maxMercatorLatitude = 85.05112878;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function isValidCoordinate(coords?: { lat?: number; lng?: number } | null): coords is { lat: number; lng: number } {
  return typeof coords?.lat === "number" &&
    typeof coords.lng === "number" &&
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lng) &&
    Math.abs(coords.lat) <= maxMercatorLatitude &&
    Math.abs(coords.lng) <= 180;
}

export function calculateDistanceMeters(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
) {
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);

  const a = Math.sin(deltaLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * c;
}
