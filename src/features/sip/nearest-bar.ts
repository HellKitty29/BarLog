import type { Bar } from "@/types/domain";
import { calculateDistanceMeters, isValidCoordinate } from "@/services/location/geo-utils";

export type NearbyBarAutofill = {
  barName: string;
  city?: string;
};

export function getNearestBarAutofill(
  bars: Bar[],
  coords: { lat: number; lng: number }
): NearbyBarAutofill | null {
  const nearest = bars
    .map((bar) => ({
      bar,
      distance: typeof bar.distanceMeters === "number"
        ? bar.distanceMeters
        : isValidCoordinate(bar)
          ? calculateDistanceMeters(coords, { lat: bar.lat, lng: bar.lng })
          : Number.POSITIVE_INFINITY
    }))
    .sort((first, second) => first.distance - second.distance)[0];

  if (!nearest?.bar.name || !Number.isFinite(nearest.distance)) {
    return null;
  }

  return {
    barName: nearest.bar.name,
    city: nearest.bar.city
  };
}
