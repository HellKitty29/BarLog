import { useLocalSearchParams } from "expo-router";
import { Text, StyleSheet } from "react-native";
import { AppCard } from "@/components/common/AppCard";
import { AppHeader } from "@/components/common/AppHeader";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingView } from "@/components/common/LoadingView";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { useBarDetailQuery } from "@/features/bars/bars.queries";
import { colors, typography } from "@/theme";

export default function BarDetailScreen() {
  const { barId } = useLocalSearchParams<{ barId: string }>();
  const bar = useBarDetailQuery(barId);

  return (
    <ScrollScreen>
      <AppHeader title="Bar detail" />
      {bar.isLoading ? <LoadingView /> : null}
      {bar.isError ? <ErrorState message={bar.error.message} /> : null}
      {bar.data ? (
        <AppCard>
          <Text style={styles.title}>{bar.data.name}</Text>
          <Text style={styles.body}>{bar.data.description ?? bar.data.address}</Text>
        </AppCard>
      ) : null}
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.heading,
    color: colors.text
  },
  body: {
    ...typography.body,
    color: colors.textMuted
  }
});
