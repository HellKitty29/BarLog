import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

type EmptyStateProps = {
  title: string;
  body?: string;
};

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.xl
  },
  title: {
    ...typography.heading,
    color: colors.text,
    textAlign: "center"
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center"
  }
});
