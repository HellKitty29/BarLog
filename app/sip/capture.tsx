import { router } from "expo-router";
import { AppButton } from "@/components/common/AppButton";
import { AppHeader } from "@/components/common/AppHeader";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { pickImageFromLibrary } from "@/services/camera/image-picker-service";
import { useSipDraftStore } from "@/features/sip/sip.store";

export default function SipCaptureScreen() {
  const updateDraft = useSipDraftStore((state) => state.updateDraft);

  async function choosePhoto() {
    const result = await pickImageFromLibrary();
    if (!result.canceled) {
      updateDraft({ localPhotoUri: result.assets[0]?.uri });
      router.push("/sip/photo-preview");
    }
  }

  return (
    <ScrollScreen>
      <AppHeader title="Sip" subtitle="Capture or upload a drink photo." />
      <AppButton label="Upload from library" onPress={choosePhoto} />
      <AppButton label="Continue without photo" onPress={() => router.push("/sip/card-edit")} variant="secondary" />
    </ScrollScreen>
  );
}
