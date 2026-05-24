import { router } from "expo-router";
import { AppButton } from "@/components/common/AppButton";
import { AppHeader } from "@/components/common/AppHeader";
import { ScrollScreen } from "@/components/layout/ScrollScreen";

export default function OnboardingScreen() {
  return (
    <ScrollScreen>
      <AppHeader title="Welcome to BarLog" subtitle="Diary, Map, Sip, and Me are ready for your backend." />
      <AppButton label="Enter BarLog" onPress={() => router.replace("/(tabs)/diary")} />
    </ScrollScreen>
  );
}
