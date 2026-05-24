import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { DrinkCollectionItem } from "./drinks.types";

export const drinksApi = {
  getCollection: () =>
    apiClient.get<DrinkCollectionItem[]>("/api/drinks/collection"),
  getDetail: (drinkId: string) =>
    apiClient.get<DrinkCollectionItem>(`/api/drinks/${drinkId}`),
  getBackendContractHint: () => endpoints.checkins.recent
};
