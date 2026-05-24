import { TextInput, type TextInputProps, StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "@/theme";

export function AppTextInput(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textSubtle}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.text,
    minHeight: 48,
    paddingHorizontal: spacing.lg
  }
});
