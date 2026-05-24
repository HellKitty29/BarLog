import { router } from "expo-router";
import { useCallback } from "react";
import { SplashCocktailScreen } from "@/components/splash/SplashCocktailScreen";
import { getLocalSessionUser } from "@/features/auth/local-session";
import { useAuthStore } from "@/features/auth/auth.store";

export default function IndexRoute() {
  const setUser = useAuthStore((state) => state.setUser);

  const handleFinish = useCallback(async () => {
    const user = await getLocalSessionUser();
    if (user) {
      setUser(user);
      router.replace("/(tabs)/diary");
      return;
    }

    router.replace("/(auth)/login");
  }, [setUser]);

  return <SplashCocktailScreen onFinish={handleFinish} />;
}
