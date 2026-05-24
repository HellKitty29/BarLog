import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
};

export function SectionHeader({ title, actionLabel }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? <Text style={styles.action}>{actionLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  title: {
    ...typography.heading,
    color: colors.text
  },
  action: {
    ...typography.caption,
    color: colors.accent,
    marginLeft: spacing.md
  }
});
