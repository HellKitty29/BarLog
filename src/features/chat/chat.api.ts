import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { ChatMessage } from "@/types/domain";
import type { ConversationsResponse, MessagesResponse } from "./chat.types";

export const chatApi = {
  getConversations: () =>
    apiClient.get<ConversationsResponse>(endpoints.chat.conversations),
  getMessages: (conversationId: string) =>
    apiClient.get<MessagesResponse>(endpoints.chat.messages(conversationId)),
  sendMessage: (conversationId: string, body: string) =>
    apiClient.post<ChatMessage>(endpoints.chat.messages(conversationId), { body }),
  markRead: (conversationId: string) =>
    apiClient.post<void>(endpoints.chat.read(conversationId))
};
