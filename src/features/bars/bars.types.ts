import type { Bar, CheckIn } from "@/types/domain";

export type NearbyBarsParams = {
  lat?: number;
  lng?: number;
  city?: string;
  radiusMeters?: number;
};

export type BarRankingsParams = {
  city?: string;
  type?: string;
};

export type BarDetail = Bar & {
  description?: string;
  openingHours?: string;
  checkInCount?: number;
};

export type BarCheckinsResponse = {
  items: CheckIn[];
};

export type NearbyBarsResponse = {
  items: Bar[];
  source: "google_places" | "mock_fallback" | "google_places_error";
  message?: string;
};
