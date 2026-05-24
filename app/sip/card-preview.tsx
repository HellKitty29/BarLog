import { Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { AppHeader } from "@/components/common/AppHeader";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { colors, typography } from "@/theme";

export default function CardPreviewScreen() {
  return (
    <ScrollScreen>
      <AppHeader title="Card preview" subtitle="Connect this step to /api/ai/generate-card-copy." />
      <AppCard>
        <Text style={styles.title}>Tonight's Sip</Text>
        <Text style={styles.body}>Generated card rendering placeholder.</Text>
      </AppCard>
      <AppButton label="Edit details" onPress={() => router.push("/sip/card-edit")} />
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.text
  },
  body: {
    ...typography.body,
    color: colors.textMuted
  }
});
