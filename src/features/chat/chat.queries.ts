import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { chatApi } from "./chat.api";

export function useConversationsQuery() {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: chatApi.getConversations
  });
}

export function useConversationMessagesQuery(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.conversationMessages(conversationId),
    queryFn: () => chatApi.getMessages(conversationId),
    enabled: Boolean(conversationId)
  });
}
