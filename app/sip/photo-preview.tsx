import { Image, StyleSheet } from "react-native";
import { router } from "expo-router";
import { AppButton } from "@/components/common/AppButton";
import { AppHeader } from "@/components/common/AppHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { useSipDraftStore } from "@/features/sip/sip.store";

export default function PhotoPreviewScreen() {
  const uri = useSipDraftStore((state) => state.draft.localPhotoUri);

  return (
    <ScrollScreen>
      <AppHeader title="Photo preview" />
      {uri ? <Image source={{ uri }} style={styles.image} /> : <EmptyState title="No photo selected" />}
      <AppButton label="Generate card" onPress={() => router.push("/sip/card-preview")} />
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 8,
    height: 360,
    width: "100%"
  }
});
