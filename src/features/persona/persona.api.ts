import { apiClient } from "@/services/api/client";
import type { PersonaProfile } from "./persona.types";

export const personaApi = {
  getCurrent: () => apiClient.get<PersonaProfile>("/api/persona/current")
};
