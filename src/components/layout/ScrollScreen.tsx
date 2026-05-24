import { ReactNode } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { colors, spacing } from "@/theme";

type ScrollScreenProps = {
  children: ReactNode;
};

export function ScrollScreen({ children }: ScrollScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.container}>
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
    padding: spacing.lg,
    gap: spacing.lg
  }
});
