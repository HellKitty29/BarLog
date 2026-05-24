import { create } from "zustand";
import type { SipDraft } from "@/types/domain";

const initialDraft: SipDraft = {
  moodTags: [],
  cardStyle: "receipt",
  visibility: "private",
  socialStatus: "not_social"
};

type SipDraftState = {
  draft: SipDraft;
  updateDraft: (patch: Partial<SipDraft>) => void;
  resetDraft: () => void;
};

export const useSipDraftStore = create<SipDraftState>((set) => ({
  draft: initialDraft,
  updateDraft: (patch) =>
    set((state) => ({
      draft: {
        ...state.draft,
        ...patch
      }
    })),
  resetDraft: () => set({ draft: initialDraft })
}));
