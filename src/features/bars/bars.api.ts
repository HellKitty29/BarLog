import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { Bar } from "@/types/domain";
import { normalizeNearbyBarsResponse } from "./bars.helpers";
import type { BarCheckinsResponse, BarDetail, BarRankingsParams, NearbyBarsParams, NearbyBarsResponse } from "./bars.types";

export const barsApi = {
  getNearby: async (params: NearbyBarsParams) => {
    const response = await apiClient.get<Bar[] | NearbyBarsResponse | Record<string, unknown>>(endpoints.bars.nearby, { params });
    return normalizeNearbyBarsResponse(response);
  },
  getDetail: (barId: string) =>
    apiClient.get<BarDetail>(endpoints.bars.detail(barId)),
  getRankings: (params: BarRankingsParams) =>
    apiClient.get<Bar[]>(endpoints.bars.rankings, { params }),
  getCheckins: (barId: string) =>
    apiClient.get<BarCheckinsResponse>(endpoints.bars.checkins(barId))
};
