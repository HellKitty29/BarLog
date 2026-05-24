import { create } from "zustand";

type ChatState = {
  activeConversationId?: string;
  setActiveConversationId: (conversationId?: string) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: undefined,
  setActiveConversationId: (activeConversationId) => set({ activeConversationId })
}));
