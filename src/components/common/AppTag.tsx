import { StyleSheet, Text } from "react-native";
import { colors, radius, spacing, typography } from "@/theme";

type AppTagProps = {
  label: string;
};

export function AppTag({ label }: AppTagProps) {
  return <Text style={styles.tag}>{label}</Text>;
}

const styles = StyleSheet.create({
  tag: {
    ...typography.caption,
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.pill,
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  }
});
