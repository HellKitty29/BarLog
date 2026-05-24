import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";
import { AppButton } from "@/components/common/AppButton";
import { AppHeader } from "@/components/common/AppHeader";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { sipApi } from "@/features/sip/sip.api";
import { draftToCreateCheckInPayload } from "@/features/sip/sip.helpers";
import { useSipDraftStore } from "@/features/sip/sip.store";
import { uploadApi } from "@/features/upload/upload.api";
import { createImageFormData } from "@/features/upload/upload.helpers";
import type { SipDraft } from "@/types/domain";

export default function PublishScreen() {
  const draft = useSipDraftStore((state) => state.draft);
  const updateDraft = useSipDraftStore((state) => state.updateDraft);
  const mutation = useMutation({
    mutationFn: async (currentDraft: SipDraft) => {
      let uploadedPhotoUrl = currentDraft.uploadedPhotoUrl;

      if (!uploadedPhotoUrl && currentDraft.localPhotoUri) {
        const upload = await uploadApi.uploadImage(createImageFormData(currentDraft.localPhotoUri));
        uploadedPhotoUrl = upload.imageUrl;
        updateDraft({ uploadedPhotoUrl });
      }

      return sipApi.createCheckIn(
        draftToCreateCheckInPayload({
          ...currentDraft,
          uploadedPhotoUrl
        })
      );
    },
    onSuccess() {
      router.replace("/sip/card-result");
    },
    onError(error) {
      Alert.alert("Publish failed", error instanceof Error ? error.message : "Please try again.");
    }
  });

  return (
    <ScrollScreen>
      <AppHeader title="Publish" subtitle="Uploads must set uploadedPhotoUrl before final publish." />
      <AppButton
        label={mutation.isPending ? "Publishing..." : "Publish check-in"}
        onPress={() => {
          mutation.mutate(draft);
        }}
      />
    </ScrollScreen>
  );
}
