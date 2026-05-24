import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { AppCard } from "@/components/common/AppCard";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { clearLocalSessionUser, saveLocalSessionUser } from "@/features/auth/local-session";
import { useAuthStore } from "@/features/auth/auth.store";
import { clearTokens } from "@/services/storage/token-storage";

export default function MeScreen() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const displayName = user?.displayName || "Crimson Guest";
  const email = user?.email || "guest@barlog.local";

  const logout = () => {
    Alert.alert("安全关闭账户", "确认退出当前 BarLog 会话？你的本地日志会被保留。", [
      { text: "取消", style: "cancel" },
      {
        text: "登出",
        style: "destructive",
        onPress: () => {
          void Promise.all([clearLocalSessionUser(), clearTokens()]).finally(() => {
            setUser(null);
            router.replace("/(auth)/login");
          });
        }
      }
    ]);
  };

  const resetProfile = () => {
    Alert.alert("档案重置", "将当前本地身份恢复为 Crimson Guest。", [
      { text: "取消", style: "cancel" },
      {
        text: "重置",
        style: "destructive",
        onPress: () => {
          const resetUser = {
            id: "local-reset",
            displayName: "Crimson Guest",
            email: "guest@barlog.local",
            city: "Shanghai",
            persona: "Crimson night explorer"
          };
          void saveLocalSessionUser(resetUser);
          setUser(resetUser);
        }
      }
    ]);
  };

  return (
    <ScrollScreen>
      <LinearGradient colors={["#2d0907", "#1b1110"]} style={styles.hero}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="glass-cocktail" size={34} color="#faf6ee" />
        </View>
        <View style={styles.identity}>
          <Text numberOfLines={1} style={styles.name}>
            {displayName}
          </Text>
          <Text numberOfLines={1} style={styles.email}>
            {email}
          </Text>
          <Text style={styles.badge}>SHANGHAI PRIVATE CELLAR</Text>
        </View>
      </LinearGradient>

      <AppCard>
        <Text style={styles.sectionTitle}>微醺人格</Text>
        <Text style={styles.body}>
          {user?.persona || "登录后会根据你的记录生成专属品酒人格。"}
        </Text>
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>高级设置管理</Text>
        <Text style={styles.body}>
          管理本地身份、档案重置和安全登出。账户关闭后会返回黑红登录殿堂。
        </Text>
        <View style={styles.actionRow}>
          <Pressable onPress={resetProfile} style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}>
            <Ionicons name="refresh-outline" size={16} color="#fca5a5" />
            <Text style={styles.outlineText}>档案重置</Text>
          </Pressable>
          <Pressable onPress={logout} style={({ pressed }) => [styles.dangerButton, pressed && styles.pressed]}>
            <Ionicons name="exit-outline" size={16} color="#ffffff" />
            <Text style={styles.dangerText}>登出/安全关闭</Text>
          </Pressable>
        </View>
      </AppCard>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    borderColor: "rgba(198, 131, 52, 0.22)",
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: "row",
    gap: 16,
    overflow: "hidden",
    padding: 18
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "rgba(198, 131, 52, 0.22)",
    borderColor: "rgba(250, 246, 238, 0.24)",
    borderRadius: 34,
    borderWidth: 1,
    height: 68,
    justifyContent: "center",
    width: 68
  },
  identity: {
    flex: 1,
    minWidth: 0
  },
  name: {
    color: "#faf6ee",
    fontSize: 22,
    fontWeight: "900"
  },
  email: {
    color: "#b8aaa1",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4
  },
  badge: {
    color: "#c68334",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 8
  },
  sectionTitle: {
    color: "#faf6ee",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8
  },
  body: {
    color: "#b4ac9f",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  outlineButton: {
    alignItems: "center",
    borderColor: "rgba(252, 165, 165, 0.36)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 8
  },
  dangerButton: {
    alignItems: "center",
    backgroundColor: "#991b1b",
    borderRadius: 14,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 8
  },
  outlineText: {
    color: "#fca5a5",
    fontSize: 12,
    fontWeight: "900"
  },
  dangerText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900"
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }]
  }
});
