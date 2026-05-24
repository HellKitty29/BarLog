import { useQuery } from "@tanstack/react-query";
import { personaApi } from "./persona.api";

export function usePersonaQuery() {
  return useQuery({
    queryKey: ["persona", "current"],
    queryFn: personaApi.getCurrent
  });
}
