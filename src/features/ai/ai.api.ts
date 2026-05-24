import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { IcebreakerResponse, RecognizeDrinkResponse } from "./ai.types";

export const aiApi = {
  recognizeDrink: (imageUrl: string) =>
    apiClient.post<RecognizeDrinkResponse>(endpoints.ai.recognizeDrink, { imageUrl }),
  generatePersona: () =>
    apiClient.post<{ statement: string }>(endpoints.ai.generatePersona),
  generateMatchReason: (candidateId: string) =>
    apiClient.post<{ reason: string }>(endpoints.ai.matchReason, { candidateId }),
  getIcebreakers: (conversationId: string) =>
    apiClient.post<IcebreakerResponse>(endpoints.ai.icebreakers, { conversationId })
};
