import { AppHeader } from "@/components/common/AppHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ScrollScreen } from "@/components/layout/ScrollScreen";

export default function BarCheckinsScreen() {
  return (
    <ScrollScreen>
      <AppHeader title="Bar check-ins" />
      <EmptyState title="Connect /api/bars/:barId/checkins" />
    </ScrollScreen>
  );
}
