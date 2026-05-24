import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/theme";

type AppIconButtonProps = {
  name: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  accessibilityLabel: string;
};

export function AppIconButton({ name, onPress, accessibilityLabel }: AppIconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.button}
    >
      <Ionicons color={colors.text} name={name} size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: "center",
    width: 44
  }
});
