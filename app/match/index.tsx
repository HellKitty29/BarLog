import { Text, StyleSheet } from "react-native";
import { AppCard } from "@/components/common/AppCard";
import { AppHeader } from "@/components/common/AppHeader";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingView } from "@/components/common/LoadingView";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { useMatchCandidatesQuery } from "@/features/match/match.queries";
import { colors, typography } from "@/theme";

export default function MatchScreen() {
  const candidates = useMatchCandidatesQuery();

  return (
    <ScrollScreen>
      <AppHeader title="Match" subtitle="Drink buddy suggestions from /api/match/candidates." />
      {candidates.isLoading ? <LoadingView /> : null}
      {candidates.isError ? <ErrorState message={candidates.error.message} /> : null}
      {candidates.data?.map((candidate) => (
        <AppCard key={candidate.id}>
          <Text style={styles.title}>{candidate.displayName}</Text>
          <Text style={styles.body}>{candidate.reason ?? "No reason returned"}</Text>
        </AppCard>
      ))}
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
