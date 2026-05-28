import type { Bar } from "@/types/domain";
import type { NearbyBarsResponse } from "./bars.types";

type NearbyBarsPayload = Partial<NearbyBarsResponse> | Bar[] | Record<string, unknown> | unknown;

function readBarsArray(response: NearbyBarsPayload) {
  if (Array.isArray(response)) {
    return normalizeBars(response);
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const payload = response as Record<string, unknown>;
  const candidates = [payload.items, payload.data, payload.bars, payload.results];
  const arrayValue = candidates.find(Array.isArray);

  return Array.isArray(arrayValue) ? normalizeBars(arrayValue) : [];
}

function normalizeBars(items: unknown[]) {
  return items.map((item) => {
    const payload = item as Record<string, unknown>;
    const coordinate = normalizeCoordinate(
      readNumber(payload.lat) ?? readNumber(payload.latitude),
      readNumber(payload.lng) ?? readNumber(payload.longitude)
    );
    const distanceMeters = readNumber(payload.distanceMeters) ??
      readNumber(payload.distance_meters) ??
      readNumber(payload.distance);

    return {
      ...payload,
      lat: coordinate?.lat,
      lng: coordinate?.lng,
      distanceMeters
    } as Bar;
  });
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function normalizeCoordinate(lat?: number, lng?: number) {
  if (typeof lat !== "number" || typeof lng !== "number") {
    return undefined;
  }

  const direct = isCoordinateInRange(lat, lng) ? { lat, lng } : undefined;
  const swapped = isCoordinateInRange(lng, lat) ? { lat: lng, lng: lat } : undefined;

  return direct ?? swapped;
}

function isCoordinateInRange(lat: number, lng: number) {
  return Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 85.05112878 &&
    Math.abs(lng) <= 180;
}

export function normalizeNearbyBarsResponse(response: NearbyBarsPayload): NearbyBarsResponse {
  if (response && typeof response === "object" && !Array.isArray(response) && "items" in response) {
    const payload = response as Partial<NearbyBarsResponse>;

    return {
      items: readBarsArray(response),
      source: payload.source ?? "google_places",
      message: payload.message
    };
  }

  return {
    items: readBarsArray(response),
    source: "google_places",
    message: undefined
  };
}
