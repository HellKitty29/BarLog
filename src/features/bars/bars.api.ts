import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { Bar } from "@/types/domain";
import type { BarCheckinsResponse, BarDetail, BarRankingsParams, NearbyBarsParams } from "./bars.types";

export const barsApi = {
  getNearby: (params: NearbyBarsParams) =>
    apiClient.get<Bar[]>(endpoints.bars.nearby, { params }),
  getDetail: (barId: string) =>
    apiClient.get<BarDetail>(endpoints.bars.detail(barId)),
  getRankings: (params: BarRankingsParams) =>
    apiClient.get<Bar[]>(endpoints.bars.rankings, { params }),
  getCheckins: (barId: string) =>
    apiClient.get<BarCheckinsResponse>(endpoints.bars.checkins(barId))
};
