import { AppHeader } from "@/components/common/AppHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ScrollScreen } from "@/components/layout/ScrollScreen";

export default function MatchQuizScreen() {
  return (
    <ScrollScreen>
      <AppHeader title="Match quiz" />
      <EmptyState title="Connect /api/match/session and /api/match/answer" />
    </ScrollScreen>
  );
}
