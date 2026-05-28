import type { CheckIn } from "@/types/domain";
import type { RecentSipsResponse } from "./diary.types";

type RecentSipsPayload = Partial<RecentSipsResponse> | CheckIn[] | unknown;

export function normalizeRecentSipsResponse(response: RecentSipsPayload): RecentSipsResponse {
  if (Array.isArray(response)) {
    return { items: response as CheckIn[] };
  }

  if (response && typeof response === "object" && "items" in response) {
    const items = (response as Partial<RecentSipsResponse>).items;
    return { items: Array.isArray(items) ? items : [] };
  }

  return { items: [] };
}
