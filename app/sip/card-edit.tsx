import { router } from "expo-router";
import { useState } from "react";
import { AppButton } from "@/components/common/AppButton";
import { AppHeader } from "@/components/common/AppHeader";
import { AppTextInput } from "@/components/common/AppTextInput";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { useSipDraftStore } from "@/features/sip/sip.store";

export default function CardEditScreen() {
  const updateDraft = useSipDraftStore((state) => state.updateDraft);
  const [drinkName, setDrinkName] = useState("");
  const [barName, setBarName] = useState("");

  return (
    <ScrollScreen>
      <AppHeader title="Details" subtitle="These fields become the POST /api/checkins payload." />
      <AppTextInput placeholder="Drink name" value={drinkName} onChangeText={setDrinkName} />
      <AppTextInput placeholder="Bar name" value={barName} onChangeText={setBarName} />
      <AppButton
        label="Continue"
        onPress={() => {
          updateDraft({ drinkName, barName, drinkCategory: "cocktail" });
          router.push("/sip/publish");
        }}
      />
    </ScrollScreen>
  );
}
