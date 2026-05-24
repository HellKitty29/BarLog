import { AppHeader } from "@/components/common/AppHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ScrollScreen } from "@/components/layout/ScrollScreen";

export default function SettingsScreen() {
  return (
    <ScrollScreen>
      <AppHeader title="Settings" />
      <EmptyState title="Profile, privacy, safety, and notifications" />
    </ScrollScreen>
  );
}
