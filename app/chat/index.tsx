import { Pressable, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { AppCard } from "@/components/common/AppCard";
import { AppHeader } from "@/components/common/AppHeader";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingView } from "@/components/common/LoadingView";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { useConversationsQuery } from "@/features/chat/chat.queries";
import { colors, typography } from "@/theme";

export default function ChatIndexScreen() {
  const conversations = useConversationsQuery();

  return (
    <ScrollScreen>
      <AppHeader title="Chats" />
      {conversations.isLoading ? <LoadingView /> : null}
      {conversations.isError ? <ErrorState message={conversations.error.message} /> : null}
      {conversations.data?.items.map((conversation) => (
        <Link href={`/chat/${conversation.id}`} key={conversation.id} asChild>
          <Pressable>
            <AppCard>
              <Text style={styles.title}>{conversation.title}</Text>
              <Text style={styles.body}>{conversation.lastMessage}</Text>
            </AppCard>
          </Pressable>
        </Link>
      ))}
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.heading,
    color: colors.text
  },
  body: {
    ...typography.body,
    color: colors.textMuted
  }
});
