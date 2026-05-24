import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/theme";

type Segment = {
  key: string;
  label: string;
};

type AppSegmentedControlProps = {
  segments: readonly Segment[];
  value: string;
  onChange: (value: string) => void;
};

export function AppSegmentedControl({ segments, value, onChange }: AppSegmentedControlProps) {
  return (
    <View style={styles.container}>
      {segments.map((segment) => {
        const selected = segment.key === value;
        return (
          <Pressable
            accessibilityRole="button"
            key={segment.key}
            onPress={() => onChange(segment.key)}
            style={[styles.item, selected && styles.selectedItem]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: "row",
    padding: spacing.xs
  },
  item: {
    alignItems: "center",
    borderRadius: radius.pill,
    flex: 1,
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: spacing.sm
  },
  selectedItem: {
    backgroundColor: colors.primary
  },
  label: {
    ...typography.caption,
    color: colors.textMuted
  },
  selectedLabel: {
    color: colors.white,
    fontWeight: "700"
  }
});
