import { router } from "expo-router";
import { AppButton } from "@/components/common/AppButton";
import { AppHeader } from "@/components/common/AppHeader";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { useSipDraftStore } from "@/features/sip/sip.store";

export default function CardResultScreen() {
  const resetDraft = useSipDraftStore((state) => state.resetDraft);

  return (
    <ScrollScreen>
      <AppHeader title="Saved" subtitle="The backend accepted your check-in." />
      <AppButton
        label="Back to Diary"
        onPress={() => {
          resetDraft();
          router.replace("/(tabs)/diary");
        }}
      />
    </ScrollScreen>
  );
}
