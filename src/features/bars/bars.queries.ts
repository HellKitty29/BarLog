import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { barsApi } from "./bars.api";
import type { NearbyBarsParams } from "./bars.types";

export function useNearbyBarsQuery(params: NearbyBarsParams) {
  return useQuery({
    queryKey: queryKeys.nearbyBars(params.city),
    queryFn: () => barsApi.getNearby(params)
  });
}

export function useBarDetailQuery(barId: string) {
  return useQuery({
    queryKey: queryKeys.barDetail(barId),
    queryFn: () => barsApi.getDetail(barId),
    enabled: Boolean(barId)
  });
}
