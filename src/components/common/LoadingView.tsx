import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

type LoadingViewProps = {
  label?: string;
};

export function LoadingView({ label = "Loading" }: LoadingViewProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.xl
  },
  label: {
    ...typography.caption,
    color: colors.textMuted
  }
});
