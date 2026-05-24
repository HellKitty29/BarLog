import { AppHeader } from "@/components/common/AppHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ScrollScreen } from "@/components/layout/ScrollScreen";

export default function NotificationSettingsScreen() {
  return (
    <ScrollScreen>
      <AppHeader title="Notifications" />
      <EmptyState title="Connect notification settings endpoint" />
    </ScrollScreen>
  );
}
