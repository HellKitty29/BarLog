import type { Coordinates } from "./location-service";
import { calculateDistanceMeters, isValidCoordinate } from "./geo-utils";

export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export const nearbyBarsRadiusMeters = 2000;

const defaultMapDelta = 0.018;
const minMapDelta = 0.01;
const maxMapDelta = 0.16;
const maxBarDistanceForMapMeters = 25000;
export const defaultDiscoveryCoordinates = {
  lat: 31.2206,
  lng: 121.4548
};

export function createUserMapRegion(coords: Coordinates): MapRegion {
  const center = isValidCoordinate(coords) ? coords : defaultDiscoveryCoordinates;

  return {
    latitude: center.lat,
    longitude: center.lng,
    latitudeDelta: defaultMapDelta,
    longitudeDelta: defaultMapDelta
  };
}

export function createMapRegionForCoordinates(
  center: Coordinates,
  points: { lat?: number; lng?: number }[]
): MapRegion {
  const safeCenter = isValidCoordinate(center) ? center : defaultDiscoveryCoordinates;
  const validPoints = points
    .filter(isValidCoordinate)
    .filter((point) => calculateDistanceMeters(safeCenter, point) <= maxBarDistanceForMapMeters);

  if (!validPoints.length) {
    return createUserMapRegion(safeCenter);
  }

  const latitudes = [safeCenter.lat, ...validPoints.map((point) => point.lat)];
  const longitudes = [safeCenter.lng, ...validPoints.map((point) => point.lng)];
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const latitudeDelta = clampDelta((maxLat - minLat) * 1.7);
  const longitudeDelta = clampDelta((maxLng - minLng) * 1.7);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta,
    longitudeDelta
  };
}

function clampDelta(value: number) {
  if (!Number.isFinite(value)) {
    return defaultMapDelta;
  }

  return Math.min(maxMapDelta, Math.max(minMapDelta, value));
}

export function createNearbyBarsParams(coords: Coordinates | null) {
  if (!coords) {
    return null;
  }

  return {
    lat: coords.lat,
    lng: coords.lng,
    radiusMeters: nearbyBarsRadiusMeters
  };
}
