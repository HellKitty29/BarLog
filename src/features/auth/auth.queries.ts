import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { authApi } from "./auth.api";

export function useAuthMeQuery() {
  return useQuery({
    queryKey: queryKeys.authMe,
    queryFn: authApi.me,
    retry: false
  });
}
