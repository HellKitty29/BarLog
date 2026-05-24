import { AppHeader } from "@/components/common/AppHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ScrollScreen } from "@/components/layout/ScrollScreen";

export default function ForgotPasswordScreen() {
  return (
    <ScrollScreen>
      <AppHeader title="Reset password" />
      <EmptyState title="Backend endpoint needed" body="Add your reset password endpoint and connect this form." />
    </ScrollScreen>
  );
}
