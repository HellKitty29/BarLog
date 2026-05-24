import { useLocalSearchParams } from "expo-router";
import { Text, StyleSheet } from "react-native";
import { AppCard } from "@/components/common/AppCard";
import { AppHeader } from "@/components/common/AppHeader";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingView } from "@/components/common/LoadingView";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { useConversationMessagesQuery } from "@/features/chat/chat.queries";
import { colors, typography } from "@/theme";

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const messages = useConversationMessagesQuery(conversationId);

  return (
    <ScrollScreen>
      <AppHeader title="Conversation" />
      {messages.isLoading ? <LoadingView /> : null}
      {messages.isError ? <ErrorState message={messages.error.message} /> : null}
      {messages.data?.items.map((message) => (
        <AppCard key={message.id}>
          <Text style={styles.body}>{message.body}</Text>
        </AppCard>
      ))}
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  body: {
    ...typography.body,
    color: colors.text
  }
});
