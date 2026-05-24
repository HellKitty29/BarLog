export function toLatLngParams(coords?: { lat?: number; lng?: number }) {
  return {
    lat: coords?.lat,
    lng: coords?.lng
  };
}
