import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing, typography } from "@/theme";

type AppButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
};

export function AppButton({ label, onPress, variant = "primary" }: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.button, variant === "secondary" && styles.secondary]}
    >
      <Text style={[styles.label, variant === "secondary" && styles.secondaryLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: spacing.xl
  },
  secondary: {
    backgroundColor: colors.surfaceElevated
  },
  label: {
    ...typography.body,
    color: colors.white,
    fontWeight: "700"
  },
  secondaryLabel: {
    color: colors.text
  }
});
