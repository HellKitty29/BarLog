import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppCard } from "@/components/common/AppCard";
import { AppHeader } from "@/components/common/AppHeader";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { useAuthStore } from "@/features/auth/auth.store";
import { saveLocalSessionUser } from "@/features/auth/local-session";
import { profileApi } from "@/features/profile/profile.api";
import { spacing } from "@/theme";

export default function ProfileSettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
  }, [user?.displayName]);

  async function saveDisplayName() {
    const trimmed = displayName.trim();
    if (trimmed.length < 2) {
      Alert.alert("Invalid name", "Display name must be at least 2 characters.");
      return;
    }
    if (!user || trimmed === user.displayName) {
      return;
    }

    setSaving(true);
    try {
      const updated = await profileApi.updateMe({ displayName: trimmed });
      const nextUser = { ...user, ...updated, email: updated.email ?? user.email ?? "" };
      setUser(nextUser);
      await saveLocalSessionUser(nextUser);
      Alert.alert("Saved", "Your display name has been updated.");
    } catch (error) {
      Alert.alert("Save failed", error instanceof Error ? error.message : "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollScreen>
      <AppHeader title="Profile settings" />
      <AppCard>
        <Text style={styles.label}>Display name</Text>
        <Text style={styles.hint}>Use a nickname instead of your Google real name. Avatar upload is available in the web PWA Me tab.</Text>
        <TextInput
          maxLength={40}
          onChangeText={setDisplayName}
          placeholder="Choose a nickname"
          placeholderTextColor="#b4ac9f"
          style={styles.input}
          value={displayName}
        />
        <Pressable disabled={saving} onPress={() => void saveDisplayName()} style={styles.button}>
          <Text style={styles.buttonText}>{saving ? "Saving..." : "Save name"}</Text>
        </Pressable>
      </AppCard>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: "#f8f3ea",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.xs
  },
  hint: {
    color: "#b4ac9f",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md
  },
  input: {
    backgroundColor: "#101014",
    borderColor: "#34343f",
    borderRadius: 14,
    borderWidth: 1,
    color: "#f8f3ea",
    fontSize: 15,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md
  },
  button: {
    alignItems: "center",
    backgroundColor: "#a5211d",
    borderRadius: 14,
    paddingVertical: spacing.md
  },
  buttonText: {
    color: "#faf6ee",
    fontSize: 15,
    fontWeight: "700"
  }
});
