import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { matchApi } from "./match.api";

export function useMatchCandidatesQuery() {
  return useQuery({
    queryKey: queryKeys.matchCandidates,
    queryFn: matchApi.getCandidates
  });
}
