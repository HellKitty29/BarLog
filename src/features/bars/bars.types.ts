import type { Bar, CheckIn } from "@/types/domain";

export type NearbyBarsParams = {
  lat?: number;
  lng?: number;
  city?: string;
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
