import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { AppCard } from "@/components/common/AppCard";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { clearLocalSessionUser, saveLocalSessionUser } from "@/features/auth/local-session";
import { useAuthStore } from "@/features/auth/auth.store";
import type { DrunkTiResult } from "@/features/persona/drunkti";
import { useDrunkTiStore } from "@/features/persona/drunkti.store";
import { clearTokens } from "@/services/storage/token-storage";

export default function MeScreen() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const drunkTiResult = useDrunkTiStore((state) => state.result);

  const displayName = user?.displayName || "Crimson Guest";
  const email = user?.email || "guest@barlog.local";

  const logout = () => {
    Alert.alert("Log out", "Close the current BarLog session? Your local diary data will stay on this device.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
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
    Alert.alert("Reset profile", "Restore the local profile identity to Crimson Guest.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
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
        <View style={styles.heroGlow} />
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="glass-cocktail" size={34} color="#faf6ee" />
        </View>
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={styles.name}>
              {displayName}
            </Text>
            <Text style={styles.proBadge}>PRO</Text>
          </View>
          <Text numberOfLines={1} style={styles.email}>
            {email}
          </Text>
          <Text numberOfLines={1} style={styles.cellar}>
            SHANGHAI PRIVATE CELLAR
          </Text>
        </View>
      </LinearGradient>

      <AppCard>
        <View style={styles.sectionHeader}>
          <Ionicons name="sparkles" size={16} color="#c68334" />
          <Text style={styles.sectionTitle}>Drinking Persona</Text>
        </View>
        <Text style={styles.body}>{user?.persona || "Your BarLog personality will grow with your saved nights."}</Text>
      </AppCard>

      <AppCard>
        {drunkTiResult ? <DrunkTiResultCard result={drunkTiResult} /> : (
          <View style={styles.mbtiCard}>
            <View style={styles.mbtiIcon}>
              <Ionicons name="planet-outline" size={24} color="#9fbf8f" />
            </View>
            <View style={styles.mbtiCopy}>
              <Text style={styles.sectionTitle}>Alcohol MBTI</Text>
              <Text style={styles.body}>Finish DrunkTI from Diary to generate your night-time drinking archetype.</Text>
            </View>
          </View>
        )}
      </AppCard>

      <AppCard>
        <View style={styles.sectionHeader}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#fca5a5" />
          <Text style={styles.sectionTitle}>Account Controls</Text>
        </View>
        <Text style={styles.body}>
          Manage local identity, profile reset, and secure logout. Closing the account returns to the crimson login portal.
        </Text>
        <View style={styles.actionRow}>
          <Pressable onPress={resetProfile} style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}>
            <Ionicons name="refresh-outline" size={16} color="#fca5a5" />
            <Text style={styles.outlineText}>Reset</Text>
          </Pressable>
          <Pressable onPress={logout} style={({ pressed }) => [styles.dangerButton, pressed && styles.pressed]}>
            <Ionicons name="exit-outline" size={16} color="#ffffff" />
            <Text style={styles.dangerText}>Log out</Text>
          </Pressable>
        </View>
      </AppCard>
    </ScrollScreen>
  );
}

function DrunkTiResultCard({ result }: { result: DrunkTiResult }) {
  return (
    <View style={styles.resultCard}>
      <View style={styles.resultTopLine}>
        <Text style={styles.resultEyebrow}>ALCOHOL PERSONALITY CERTIFICATE</Text>
        <Text style={styles.resultCode}>{result.code}</Text>
      </View>
      <View style={styles.resultIdentity}>
        <View style={styles.resultAvatar}>
          <Ionicons name="planet-outline" size={27} color="#9fbf8f" />
        </View>
        <View style={styles.resultCopy}>
          <Text numberOfLines={1} style={styles.resultName}>{result.name}</Text>
          <Text style={styles.resultTagline}>{result.tagline}</Text>
        </View>
      </View>
      <View style={styles.resultStatsGrid}>
        {result.stats.map((stat) => (
          <View key={stat.label} style={styles.resultStat}>
            <View style={styles.resultStatLabelRow}>
              <Text style={styles.resultStatLabel}>{stat.label}</Text>
              <Text style={[styles.resultStatValue, { color: stat.color }]}>{stat.value}%</Text>
            </View>
            <View style={styles.resultTrack}>
              <View style={[styles.resultTrackFill, { backgroundColor: stat.color, width: `${stat.value}%` }]} />
            </View>
          </View>
        ))}
      </View>
    </View>
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
    padding: 18,
    position: "relative"
  },
  heroGlow: {
    backgroundColor: "rgba(139, 30, 25, 0.26)",
    borderRadius: 70,
    height: 140,
    position: "absolute",
    right: -34,
    top: -42,
    width: 140
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "rgba(198, 131, 52, 0.22)",
    borderColor: "rgba(250, 246, 238, 0.24)",
    borderRadius: 34,
    borderWidth: 1,
    height: 68,
    justifyContent: "center",
    width: 68,
    zIndex: 1
  },
  identity: {
    flex: 1,
    minWidth: 0,
    zIndex: 1
  },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  name: {
    color: "#faf6ee",
    flex: 1,
    fontSize: 22,
    fontWeight: "900"
  },
  proBadge: {
    backgroundColor: "rgba(139, 30, 25, 0.38)",
    borderColor: "rgba(198, 131, 52, 0.34)",
    borderRadius: 999,
    borderWidth: 1,
    color: "#c68334",
    fontSize: 9,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  email: {
    color: "#b8aaa1",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4
  },
  cellar: {
    color: "#c68334",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 9
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 8
  },
  sectionTitle: {
    color: "#faf6ee",
    fontSize: 16,
    fontWeight: "900"
  },
  body: {
    color: "#b4ac9f",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20
  },
  mbtiCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: 13
  },
  mbtiIcon: {
    alignItems: "center",
    backgroundColor: "#10291d",
    borderColor: "rgba(159, 191, 143, 0.46)",
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  mbtiCopy: {
    flex: 1
  },
  resultCard: {
    backgroundColor: "#0d1f17",
    borderColor: "#214b34",
    borderRadius: 18,
    borderWidth: 2,
    gap: 12,
    padding: 12
  },
  resultTopLine: {
    alignItems: "center",
    borderBottomColor: "rgba(159, 191, 143, 0.22)",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 8
  },
  resultEyebrow: {
    color: "#9fbf8f",
    flex: 1,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1
  },
  resultCode: {
    backgroundColor: "#214b34",
    borderRadius: 7,
    color: "#faf6ee",
    fontSize: 10,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 3
  },
  resultIdentity: {
    alignItems: "center",
    backgroundColor: "#08150f",
    borderColor: "#214b34",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 11
  },
  resultAvatar: {
    alignItems: "center",
    backgroundColor: "#10291d",
    borderColor: "#214b34",
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  resultCopy: {
    flex: 1,
    minWidth: 0
  },
  resultName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900"
  },
  resultTagline: {
    color: "#9fbf8f",
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 15,
    marginTop: 3,
    textTransform: "uppercase"
  },
  resultStatsGrid: {
    backgroundColor: "#08150f",
    borderColor: "#214b34",
    borderRadius: 14,
    borderWidth: 1,
    gap: 9,
    padding: 11
  },
  resultStat: {
    gap: 5
  },
  resultStatLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  resultStatLabel: {
    color: "#faf6ee",
    fontSize: 10,
    fontWeight: "900"
  },
  resultStatValue: {
    fontSize: 10,
    fontWeight: "900"
  },
  resultTrack: {
    backgroundColor: "#10291d",
    borderRadius: 999,
    height: 5,
    overflow: "hidden"
  },
  resultTrackFill: {
    height: "100%"
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
