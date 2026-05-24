import { AppHeader } from "@/components/common/AppHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ScrollScreen } from "@/components/layout/ScrollScreen";

export default function PrivacySettingsScreen() {
  return (
    <ScrollScreen>
      <AppHeader title="Privacy" />
      <EmptyState title="Connect privacy settings endpoint" />
    </ScrollScreen>
  );
}
