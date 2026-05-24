import { Stack } from "expo-router";
import { colors } from "@/theme";

export default function SipFlowLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text
      }}
    />
  );
}
