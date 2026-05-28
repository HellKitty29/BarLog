import { create } from "zustand";
import type { DrunkTiResult } from "./drunkti";

type DrunkTiState = {
  result: DrunkTiResult | null;
  setResult: (result: DrunkTiResult | null) => void;
};

export const useDrunkTiStore = create<DrunkTiState>((set) => ({
  result: null,
  setResult: (result) => set({ result })
}));
