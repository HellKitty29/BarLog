import type { ChatMessage, Conversation } from "@/types/domain";

export type ConversationsResponse = {
  items: Conversation[];
};

export type MessagesResponse = {
  items: ChatMessage[];
};
