import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { barsApi } from "./bars.api";
import type { NearbyBarsParams } from "./bars.types";

export function useNearbyBarsQuery(params: NearbyBarsParams | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.nearbyBars(params),
    queryFn: () => barsApi.getNearby(params!),
    enabled: options?.enabled ?? Boolean(params),
    refetchOnMount: "always",
    staleTime: 0
  });
}

export function useBarDetailQuery(barId: string) {
  return useQuery({
    queryKey: queryKeys.barDetail(barId),
    queryFn: () => barsApi.getDetail(barId),
    enabled: Boolean(barId)
  });
}
