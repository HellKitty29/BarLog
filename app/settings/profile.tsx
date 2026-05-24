import { AppHeader } from "@/components/common/AppHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ScrollScreen } from "@/components/layout/ScrollScreen";

export default function ProfileSettingsScreen() {
  return (
    <ScrollScreen>
      <AppHeader title="Profile settings" />
      <EmptyState title="Connect profile update endpoint" />
    </ScrollScreen>
  );
}
