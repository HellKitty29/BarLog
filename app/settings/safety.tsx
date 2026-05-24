import { AppHeader } from "@/components/common/AppHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ScrollScreen } from "@/components/layout/ScrollScreen";

export default function SafetySettingsScreen() {
  return (
    <ScrollScreen>
      <AppHeader title="Safety" />
      <EmptyState title="Connect safety controls endpoint" />
    </ScrollScreen>
  );
}
