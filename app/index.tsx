import { router } from "expo-router";
import { useCallback } from "react";
import { SplashCocktailScreen } from "@/components/splash/SplashCocktailScreen";
import { getLocalSessionUser } from "@/features/auth/local-session";
import { useAuthStore } from "@/features/auth/auth.store";
import { getAccessToken } from "@/services/storage/token-storage";

export default function IndexRoute() {
  const setUser = useAuthStore((state) => state.setUser);

  const handleFinish = useCallback(async () => {
    const user = await getLocalSessionUser();
    const token = await getAccessToken();

    if (user && token) {
      setUser(user);
      router.replace("/(tabs)/diary");
      return;
    }

    router.replace("/(auth)/login");
  }, [setUser]);

  return <SplashCocktailScreen onFinish={handleFinish} />;
}
