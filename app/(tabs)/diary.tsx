import { Text, View, StyleSheet } from "react-native";
import { AppCard } from "@/components/common/AppCard";
import { AppHeader } from "@/components/common/AppHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingView } from "@/components/common/LoadingView";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useDiarySummaryQuery, useRecentSipsQuery } from "@/features/diary/diary.queries";
import { useCurrentMonth } from "@/hooks/useCurrentMonth";
import { colors, spacing, typography } from "@/theme";

export default function DiaryScreen() {
  const month = useCurrentMonth();
  const summary = useDiarySummaryQuery(month);
  const recentSips = useRecentSipsQuery();

  return (
    <ScrollScreen>
      <AppHeader title="Diary" subtitle="Your personal drinking archive." />
      {summary.isLoading ? <LoadingView label="Loading diary summary" /> : null}
      {summary.isError ? <ErrorState message={summary.error.message} /> : null}
      {summary.data ? (
        <View style={styles.stats}>
          <AppCard>
            <Text style={styles.metric}>{summary.data.checkInCount}</Text>
            <Text style={styles.label}>Check-ins</Text>
          </AppCard>
          <AppCard>
            <Text style={styles.metric}>{summary.data.barsVisited}</Text>
            <Text style={styles.label}>Bars</Text>
          </AppCard>
          <AppCard>
            <Text style={styles.metric}>{summary.data.averageRating?.toFixed(1) ?? "-"}</Text>
            <Text style={styles.label}>Avg rating</Text>
          </AppCard>
        </View>
      ) : null}
      <SectionHeader title="Recent sips" />
      {recentSips.isLoading ? <LoadingView label="Loading recent sips" /> : null}
      {recentSips.isError ? <ErrorState message={recentSips.error.message} /> : null}
      {recentSips.data?.items.length ? (
        recentSips.data.items.map((sip) => (
          <AppCard key={sip.id}>
            <Text style={styles.cardTitle}>{sip.drinkName}</Text>
            <Text style={styles.cardMeta}>{sip.barName ?? sip.city ?? "Unknown place"}</Text>
          </AppCard>
        ))
      ) : (
        !recentSips.isLoading && <EmptyState title="No sips yet" body="Create your first Sip when your backend is ready." />
      )}
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: "row",
    gap: spacing.sm
  },
  metric: {
    ...typography.title,
    color: colors.text
  },
  label: {
    ...typography.caption,
    color: colors.textMuted
  },
  cardTitle: {
    ...typography.heading,
    color: colors.text
  },
  cardMeta: {
    ...typography.caption,
    color: colors.textMuted
  }
});
