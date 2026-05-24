import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { drinksApi } from "./drinks.api";

export function useDrinkCollectionQuery() {
  return useQuery({
    queryKey: queryKeys.drinkCollection,
    queryFn: drinksApi.getCollection
  });
}
