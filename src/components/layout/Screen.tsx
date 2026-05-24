import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { colors, spacing } from "@/theme";

type ScreenProps = {
  children: ReactNode;
};

export function Screen({ children }: ScreenProps) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg
  }
});
