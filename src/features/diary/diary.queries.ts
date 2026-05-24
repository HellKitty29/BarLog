import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { diaryApi } from "./diary.api";

export function useDiarySummaryQuery(month: string) {
  return useQuery({
    queryKey: queryKeys.diarySummary(month),
    queryFn: () => diaryApi.getSummary(month)
  });
}

export function useRecentSipsQuery() {
  return useQuery({
    queryKey: queryKeys.recentSips,
    queryFn: diaryApi.getRecentSips
  });
}
