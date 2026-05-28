import { ReactNode } from "react";
import { Platform, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@/theme";

type ScrollScreenProps = {
  children: ReactNode;
};

export function ScrollScreen({ children }: ScrollScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: insets.bottom + spacing.xxl,
          paddingTop: insets.top + spacing.lg
        }
      ]}
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      keyboardShouldPersistTaps="handled"
      style={styles.container}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg
  }
});
