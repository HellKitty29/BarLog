import { create } from "zustand";

type MatchState = {
  sessionId?: string;
  setSessionId: (sessionId: string) => void;
  clearSession: () => void;
};

export const useMatchStore = create<MatchState>((set) => ({
  sessionId: undefined,
  setSessionId: (sessionId) => set({ sessionId }),
  clearSession: () => set({ sessionId: undefined })
}));
