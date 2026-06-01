import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View
} from "react-native";
import { authApi } from "@/features/auth/auth.api";
import type { AuthResponse } from "@/features/auth/auth.types";
import { useAuthStore } from "@/features/auth/auth.store";
import { saveLocalSessionUser } from "@/features/auth/local-session";
import { setAccessToken, setRefreshToken } from "@/services/storage/token-storage";

type AuthMode = "login" | "register";
type ToastKind = "error" | "success";
type GoogleAuthStatus = "idle" | "opening" | "waiting" | "completing";

const crimson = "#961c1c";
const cream = "#faf6ee";
const authCardHeight = 492;

type AuthScreenProps = {
  initialMode?: AuthMode;
};

export default function LoginScreen() {
  return <AuthScreen initialMode="login" />;
}

export function AuthScreen({ initialMode = "login" }: AuthScreenProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleAuthStatus, setGoogleAuthStatus] = useState<GoogleAuthStatus>("idle");
  const [toast, setToast] = useState<{ kind: ToastKind; message: string } | null>(null);
  const capsuleX = useRef(new Animated.Value(initialMode === "login" ? 0 : 1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const nameReveal = useRef(new Animated.Value(initialMode === "register" ? 1 : 0)).current;
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(capsuleX, {
        toValue: mode === "login" ? 0 : 1,
        friction: 9,
        tension: 95,
        useNativeDriver: true
      }),
      Animated.timing(nameReveal, {
        toValue: mode === "register" ? 1 : 0,
        duration: 180,
        useNativeDriver: true
      })
    ]).start();
  }, [capsuleX, mode, nameReveal]);

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

  const completeWithResponse = async (response: AuthResponse, fallbackEmail?: string) => {
    const user = {
      ...response.user,
      email: response.user.email ?? fallbackEmail ?? ""
    };

    await setAccessToken(response.accessToken);
    if (response.refreshToken) {
      await setRefreshToken(response.refreshToken);
    }
    await saveLocalSessionUser(user);
    setUser(user);
    router.replace("/(tabs)/diary");
  };

  const completePasswordAuth = async (nextEmail: string, nextName: string) => {
    const response = mode === "login"
      ? await authApi.login({ email: nextEmail, password })
      : await authApi.register({ displayName: nextName, email: nextEmail, password });

    await completeWithResponse(response, nextEmail);
  };

  const submit = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = displayName.trim();

    if (!trimmedEmail.includes("@")) {
      showToast("Enter a valid email to keep your night log synced.", "error");
      return;
    }
    if (password.length < 6) {
      showToast("Password needs at least 6 characters.", "error");
      return;
    }
    if (mode === "register" && trimmedName.length < 2) {
      showToast("Add a display name with at least 2 characters.", "error");
      return;
    }

    setLoading(true);
    showToast(mode === "login" ? "Signing in..." : "Creating your BarLog ID...");
    try {
      await completePasswordAuth(trimmedEmail, mode === "register" ? trimmedName : trimmedName || trimmedEmail.split("@")[0]);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to authenticate.", "error");
    } finally {
      setLoading(false);
    }
  };

  const continueWithGoogle = async () => {
    setLoading(true);
    setGoogleAuthStatus("opening");
    showToast("Opening Google sign-in...");
    try {
      const redirectUri = Linking.createURL("auth/google");
      const { authUrl } = await authApi.startGoogleAuth({ redirectUri, mode });
      setGoogleAuthStatus("waiting");
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type !== "success") {
        showToast("Google sign-in was cancelled.", "error");
        return;
      }

      setGoogleAuthStatus("completing");
      const parsed = Linking.parse(result.url);
      const accessToken = readParam(parsed.queryParams?.accessToken);
      const refreshToken = readParam(parsed.queryParams?.refreshToken);

      if (!accessToken) {
        const errorMessage = readParam(parsed.queryParams?.error) ?? "Google sign-in did not return a token.";
        showToast(errorMessage, "error");
        return;
      }

      const response = await authApi.completeGoogleAuth({ accessToken, refreshToken });
      await completeWithResponse(response);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to sign in with Google.", "error");
    } finally {
      setLoading(false);
      setGoogleAuthStatus("idle");
    }
  };

  const activeTranslate = capsuleX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 142]
  });
  const breathingOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.24, 0.52]
  });
  const nameOpacity = nameReveal.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });
  const nameTranslate = nameReveal.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 0]
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
          <Text style={styles.eyebrow}>ALCOHOL% PORTAL</Text>
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

            <Animated.View
              pointerEvents={mode === "register" ? "auto" : "none"}
              style={[
                styles.reservedNameField,
                { opacity: nameOpacity, transform: [{ translateY: nameTranslate }] }
              ]}
            >
              <AuthField
                icon={<Ionicons name="person-outline" size={18} color="#9d8c82" />}
                focused={focusedField === "name"}
                label="Display Name"
                onBlur={() => setFocusedField(null)}
                onChangeText={setDisplayName}
                onFocus={() => setFocusedField("name")}
                placeholder="Crimson Guest"
                textContentType="nickname"
                value={displayName}
              />
            </Animated.View>

            <AuthField
              autoCapitalize="none"
              icon={<Ionicons name="mail-outline" size={18} color="#9d8c82" />}
              focused={focusedField === "email"}
              keyboardType="email-address"
              label="Email Address"
              onBlur={() => setFocusedField(null)}
              onChangeText={setEmail}
              onFocus={() => setFocusedField("email")}
              placeholder="name@barlog.app"
              textContentType="emailAddress"
              value={email}
            />

            <View>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.fieldLabel}>Password</Text>
                <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
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
                <Text style={styles.submitText}>{loading ? "PLEASE WAIT..." : mode === "login" ? "ENTER BARLOG" : "CREATE NIGHT ID"}</Text>
                {!loading ? <Ionicons name="arrow-forward" size={16} color={cream} /> : null}
              </LinearGradient>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <Pressable disabled={loading} onPress={continueWithGoogle} style={({ pressed }) => [styles.googleButton, pressed && styles.socialPressed, loading && styles.disabled]}>
              <Text style={styles.googleMark}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </Pressable>

            <View style={[styles.googleAuthPanel, googleAuthStatus === "idle" && styles.googleAuthPanelIdle]}>
              {googleAuthStatus !== "idle" ? <ActivityIndicator color="#ea4335" size="small" /> : null}
              <View style={styles.googleAuthCopy}>
                <Text style={styles.googleAuthTitle}>Google authorization</Text>
                <Text style={styles.googleAuthStatus}>{getGoogleAuthStatusText(googleAuthStatus)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.privacy}>Secure connection enabled. Privacy Policy</Text>
          <Text style={styles.console}>BARLOG SYSTEM CONSOLE - EST. 2026</Text>
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

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getGoogleAuthStatusText(status: GoogleAuthStatus) {
  if (status === "opening") {
    return "Preparing secure Google redirect...";
  }
  if (status === "waiting") {
    return "Complete sign-in in the Google window.";
  }
  if (status === "completing") {
    return "Finishing BarLog sign-in...";
  }
  return "Ready to open Google sign-in.";
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
    height: authCardHeight,
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
  reservedNameField: {
    height: 72
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
  googleButton: {
    alignItems: "center",
    backgroundColor: "#f7efe7",
    borderColor: "#f3d7c5",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    height: 48,
    justifyContent: "center"
  },
  googleMark: {
    color: "#ea4335",
    fontSize: 16,
    fontWeight: "900"
  },
  googleText: {
    color: "#1e1512",
    fontSize: 13,
    fontWeight: "900"
  },
  googleAuthPanel: {
    alignItems: "center",
    borderColor: "#2b1d1a",
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "#120b0a",
    flexDirection: "row",
    gap: 10,
    height: 48,
    paddingHorizontal: 13
  },
  googleAuthPanelIdle: {
    opacity: 0
  },
  googleAuthCopy: {
    flex: 1,
    gap: 2
  },
  googleAuthTitle: {
    color: cream,
    fontSize: 11,
    fontWeight: "900"
  },
  googleAuthStatus: {
    color: "#a8988c",
    fontSize: 10,
    fontWeight: "800"
  },
  socialPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }]
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
