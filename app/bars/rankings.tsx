import { AppHeader } from "@/components/common/AppHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ScrollScreen } from "@/components/layout/ScrollScreen";

export default function RankingsScreen() {
  return (
    <ScrollScreen>
      <AppHeader title="Rankings" />
      <EmptyState title="Connect /api/bars/rankings" />
    </ScrollScreen>
  );
}
