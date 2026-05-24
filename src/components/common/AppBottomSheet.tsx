import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "@/theme";

type AppBottomSheetProps = {
  children: ReactNode;
};

export function AppBottomSheet({ children }: AppBottomSheetProps) {
  return <View style={styles.sheet}>{children}</View>;
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    gap: spacing.lg,
    padding: spacing.lg
  }
});
