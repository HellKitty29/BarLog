import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View
} from "react-native";
import { authApi } from "@/features/auth/auth.api";
import { useAuthStore } from "@/features/auth/auth.store";
import { saveLocalSessionUser } from "@/features/auth/local-session";
import { setAccessToken, setRefreshToken } from "@/services/storage/token-storage";

type AuthMode = "login" | "register";
type ToastKind = "error" | "success";

const crimson = "#961c1c";
const cream = "#faf6ee";

export default function LoginScreen() {
  const setUser = useAuthStore((state) => state.setUser);
  const [mode, setMode] = useState<AuthMode>("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ kind: ToastKind; message: string } | null>(null);
  const capsuleX = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.spring(capsuleX, {
      toValue: mode === "login" ? 0 : 1,
      friction: 9,
      tension: 95,
      useNativeDriver: true
    }).start();
  }, [capsuleX, mode]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1700,
          useNativeDriver: true
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1700,
          useNativeDriver: true
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);

  const showToast = (message: string, kind: ToastKind = "success") => {
    setToast({ kind, message });
    setTimeout(() => setToast(null), kind === "error" ? 2600 : 2100);
  };

  const completeAuth = async (nextEmail: string, nextName: string) => {
    const response = mode === "login"
      ? await authApi.login({ email: nextEmail, password })
      : await authApi.register({ displayName: nextName, email: nextEmail, password });
    const user = {
      ...response.user,
      email: response.user.email ?? nextEmail
    };

    await setAccessToken(response.accessToken);
    if (response.refreshToken) {
      await setRefreshToken(response.refreshToken);
    }
    await saveLocalSessionUser(user);
    setUser(user);
    router.replace("/(tabs)/diary");
  };

  const submit = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = displayName.trim();

    if (!trimmedEmail.includes("@")) {
      showToast("请输入有效邮箱，用来保存今夜会话。", "error");
      return;
    }
    if (password.length < 6) {
      showToast("密码至少 6 位，微醺也要安全。", "error");
      return;
    }
    if (mode === "register" && trimmedName.length < 2) {
      showToast("请写下 2 个字以上的今夜昵称。", "error");
      return;
    }

    setLoading(true);
    showToast(mode === "login" ? "正在开启私人酒单..." : "正在封存今夜昵称...");
    try {
      await completeAuth(trimmedEmail, mode === "register" ? trimmedName : trimmedName || trimmedEmail.split("@")[0]);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to authenticate.", "error");
    } finally {
      setLoading(false);
    }
  };

  const socialConnect = (platform: string, name: string) => {
    setLoading(true);
    showToast(`正在安全连接 ${platform} 授权...`);
    setTimeout(() => {
      void completeAuth(`${platform.toLowerCase()}@barlog.local`, name);
    }, 650);
  };

  const activeTranslate = capsuleX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 142]
  });
  const breathingOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.24, 0.52]
  });

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={["#0d0101", "#240404", "#050000"]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.crimsonGlow, { opacity: breathingOpacity }]} />
      <View style={styles.starOne} />
      <View style={styles.starTwo} />

      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.content}
        keyboardDismissMode="none"
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ALCOLHOL% PORTAL</Text>
          <Text style={styles.logo}>BarLog</Text>
          <View style={styles.rule} />
        </View>

        <View style={styles.cardShell}>
          <Animated.View style={[styles.cardGlow, { opacity: breathingOpacity }]} />
          <View style={styles.card}>
            <View style={styles.switcher}>
              <Animated.View style={[styles.switcherActive, { transform: [{ translateX: activeTranslate }] }]} />
              <Pressable style={styles.switcherButton} onPress={() => setMode("login")}>
                <Text style={[styles.switcherText, mode === "login" && styles.switcherTextActive]}>Login</Text>
              </Pressable>
              <Pressable style={styles.switcherButton} onPress={() => setMode("register")}>
                <Text style={[styles.switcherText, mode === "register" && styles.switcherTextActive]}>Register</Text>
              </Pressable>
            </View>

            {mode === "register" ? (
              <AuthField
                icon={<Ionicons name="person-outline" size={18} color="#9d8c82" />}
                focused={focusedField === "name"}
                label="Tonight Name / 今夜昵称"
                onBlur={() => setFocusedField(null)}
                onChangeText={setDisplayName}
                onFocus={() => setFocusedField("name")}
                placeholder="比如 Crimson Guest"
                textContentType="nickname"
                value={displayName}
              />
            ) : null}

            <AuthField
              autoCapitalize="none"
              icon={<Ionicons name="mail-outline" size={18} color="#9d8c82" />}
              focused={focusedField === "email"}
              keyboardType="email-address"
              label="Email Address / 电子邮箱"
              onBlur={() => setFocusedField(null)}
              onChangeText={setEmail}
              onFocus={() => setFocusedField("email")}
              placeholder="name@exclusive.com"
              textContentType="emailAddress"
              value={email}
            />

            <View>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.fieldLabel}>Password / 安全密语</Text>
                <Pressable onPress={() => showToast("演示模式：任意 6 位以上密码即可进入。")}>
                  <Text style={styles.forgot}>Forgot?</Text>
                </Pressable>
              </View>
              <Pressable
                onPress={() => passwordRef.current?.focus()}
                style={[styles.inputWrap, focusedField === "password" && styles.inputFocused]}
              >
                <Ionicons name="lock-closed-outline" size={18} color="#9d8c82" />
                <TextInput
                  autoComplete="password"
                  onBlur={() => setFocusedField(null)}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField("password")}
                  placeholder="••••••••"
                  placeholderTextColor="#5d4f49"
                  ref={passwordRef}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  textContentType="password"
                  value={password}
                />
                <Pressable onPress={() => setShowPassword((current) => !current)} style={styles.eyeButton}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={19} color="#b6aaa3" />
                </Pressable>
              </Pressable>
            </View>

            <Pressable disabled={loading} onPress={submit} style={({ pressed }) => [styles.submit, pressed && styles.pressed, loading && styles.disabled]}>
              <LinearGradient colors={["#8b1e19", "#bd2721"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGradient}>
                <Text style={styles.submitText}>{loading ? "POURING INSPIRATION..." : mode === "login" ? "ENTER BARLOG" : "CREATE NIGHT ID"}</Text>
                {!loading ? <Ionicons name="arrow-forward" size={16} color={cream} /> : null}
              </LinearGradient>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialRow}>
              <SocialButton label="G" tint="#ea4335" onPress={() => socialConnect("Google", "Google 品鉴家")} />
              <SocialButton icon={<FontAwesome5 name="music" size={14} color="#ffffff" />} onPress={() => socialConnect("TikTok", "TikTok 夜行者")} />
              <SocialButton label="X" tint="#e8ded8" onPress={() => socialConnect("X", "X Minimalist")} />
              <SocialButton icon={<MaterialCommunityIcons name="instagram" size={18} color="#ff5c9f" />} onPress={() => socialConnect("Instagram", "Instagram Collector")} />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.privacy}>Secure connection enabled. Privacy Policy</Text>
          <Text style={styles.console}>BARLOG SYSTEM CONSOLE © EST. 2026</Text>
        </View>
      </ScrollView>

      {toast ? (
        <View style={[styles.toast, toast.kind === "error" ? styles.toastError : styles.toastSuccess]}>
          <Ionicons name={toast.kind === "error" ? "alert-circle-outline" : "checkmark-circle-outline"} size={18} color={toast.kind === "error" ? "#fecaca" : "#a7f3d0"} />
          <Text style={[styles.toastText, toast.kind === "error" ? styles.toastErrorText : styles.toastSuccessText]}>{toast.message}</Text>
        </View>
      ) : null}
    </View>
  );
}

type AuthFieldProps = Pick<TextInputProps, "autoCapitalize" | "keyboardType" | "textContentType" | "autoComplete"> & {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  focused: boolean;
  icon: ReactNode;
  label: string;
  onBlur: () => void;
  onChangeText: (value: string) => void;
  onFocus: () => void;
  placeholder: string;
  value: string;
};

function AuthField(props: AuthFieldProps) {
  const inputRef = useRef<TextInput>(null);

  return (
    <View>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={[styles.inputWrap, props.focused && styles.inputFocused]}
      >
        {props.icon}
        <TextInput
          autoCapitalize={props.autoCapitalize}
          autoComplete={props.autoComplete}
          keyboardType={props.keyboardType}
          onBlur={props.onBlur}
          onChangeText={props.onChangeText}
          onFocus={props.onFocus}
          placeholder={props.placeholder}
          placeholderTextColor="#5d4f49"
          ref={inputRef}
          style={styles.input}
          textContentType={props.textContentType}
          value={props.value}
        />
      </Pressable>
    </View>
  );
}

function SocialButton({ icon, label, onPress, tint }: { icon?: ReactNode; label?: string; onPress: () => void; tint?: string }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.socialButton, pressed && styles.socialPressed]}>
      {icon ?? <Text style={[styles.socialLabel, tint ? { color: tint } : null]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0d0101"
  },
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingBottom: 34,
    paddingHorizontal: 22,
    paddingTop: 58
  },
  crimsonGlow: {
    position: "absolute",
    top: "18%",
    alignSelf: "center",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(150, 28, 28, 0.42)",
    shadowColor: crimson,
    shadowOpacity: 0.85,
    shadowRadius: 54
  },
  starOne: {
    position: "absolute",
    top: "23%",
    left: "50%",
    width: 1,
    height: 420,
    backgroundColor: "rgba(255,255,255,0.08)",
    transform: [{ rotate: "42deg" }]
  },
  starTwo: {
    position: "absolute",
    top: "35%",
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    transform: [{ rotate: "-14deg" }]
  },
  header: {
    alignItems: "center",
    gap: 9,
    marginBottom: 28
  },
  eyebrow: {
    color: "#c68334",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2.6
  },
  logo: {
    color: cream,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 5
  },
  rule: {
    width: 54,
    height: 1,
    backgroundColor: "rgba(198, 131, 52, 0.6)"
  },
  cardShell: {
    position: "relative"
  },
  cardGlow: {
    position: "absolute",
    bottom: -5,
    left: -5,
    right: -5,
    top: -5,
    borderRadius: 31,
    backgroundColor: "rgba(173, 34, 28, 0.34)"
  },
  card: {
    gap: 17,
    borderWidth: 1,
    borderColor: "rgba(173, 34, 28, 0.34)",
    borderRadius: 28,
    backgroundColor: "rgba(18, 9, 8, 0.92)",
    padding: 18,
    shadowColor: "#000000",
    shadowOpacity: 0.55,
    shadowRadius: 26
  },
  switcher: {
    height: 42,
    borderWidth: 1,
    borderColor: "#2a1513",
    borderRadius: 18,
    backgroundColor: "#100908",
    flexDirection: "row",
    overflow: "hidden",
    padding: 4
  },
  switcherActive: {
    position: "absolute",
    left: 4,
    top: 4,
    width: "50%",
    height: 32,
    borderRadius: 14,
    backgroundColor: "#9d211c"
  },
  switcherButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2
  },
  switcherText: {
    color: "#8e7e73",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.6
  },
  switcherTextActive: {
    color: cream
  },
  fieldLabel: {
    color: "#a8988c",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginBottom: 7,
    paddingLeft: 3
  },
  passwordLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  forgot: {
    color: "#c68334",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.4
  },
  inputWrap: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2b1d1a",
    borderRadius: 14,
    backgroundColor: "#0d0706",
    flexDirection: "row",
    minHeight: 48,
    paddingHorizontal: 13
  },
  inputFocused: {
    borderColor: crimson,
    shadowColor: crimson,
    shadowOpacity: 0.72,
    shadowRadius: 12
  },
  input: {
    color: cream,
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 10
  },
  eyeButton: {
    padding: 4
  },
  submit: {
    borderRadius: 14,
    overflow: "hidden"
  },
  submitGradient: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48
  },
  submitText: {
    color: cream,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }]
  },
  disabled: {
    opacity: 0.62
  },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#2d1f1c"
  },
  dividerText: {
    color: "#5a4f48",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1
  },
  socialRow: {
    flexDirection: "row",
    gap: 10
  },
  socialButton: {
    alignItems: "center",
    backgroundColor: "#0d0706",
    borderColor: "#2b1d1a",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    height: 46,
    justifyContent: "center"
  },
  socialPressed: {
    backgroundColor: "#1a100e",
    transform: [{ scale: 0.96 }]
  },
  socialLabel: {
    fontSize: 15,
    fontWeight: "900"
  },
  footer: {
    alignItems: "center",
    gap: 8,
    marginTop: 28
  },
  privacy: {
    color: "#66564e",
    fontSize: 10,
    fontWeight: "800"
  },
  console: {
    color: "#40332e",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1
  },
  toast: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    left: 22,
    minHeight: 50,
    paddingHorizontal: 14,
    position: "absolute",
    right: 22,
    top: 20
  },
  toastError: {
    backgroundColor: "#2d0907",
    borderColor: "#811b13"
  },
  toastSuccess: {
    backgroundColor: "#0e2010",
    borderColor: "#1d4a21"
  },
  toastText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "900"
  },
  toastErrorText: {
    color: "#fecaca"
  },
  toastSuccessText: {
    color: "#a7f3d0"
  }
});
