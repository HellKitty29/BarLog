import { AppHeader } from "@/components/common/AppHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ScrollScreen } from "@/components/layout/ScrollScreen";

export default function MatchResultsScreen() {
  return (
    <ScrollScreen>
      <AppHeader title="Match results" />
      <EmptyState title="Connect match candidates and request flow" />
    </ScrollScreen>
  );
}
