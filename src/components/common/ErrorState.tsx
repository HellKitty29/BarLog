import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

type ErrorStateProps = {
  message?: string;
};

export function ErrorState({ message = "Unable to load data." }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request failed</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryMuted,
    borderRadius: 8,
    gap: spacing.xs,
    padding: spacing.lg
  },
  title: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "700"
  },
  message: {
    ...typography.caption,
    color: colors.textMuted
  }
});
