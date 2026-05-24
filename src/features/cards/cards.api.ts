import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { GeneratedCardCopy } from "./cards.types";

export const cardsApi = {
  generateCopy: (payload: { drinkName?: string; moodTags?: string[] }) =>
    apiClient.post<GeneratedCardCopy>(endpoints.ai.generateCardCopy, payload)
};
