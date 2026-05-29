import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "@/components/common/AppButton";
import { AppHeader } from "@/components/common/AppHeader";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { sipApi } from "@/features/sip/sip.api";
import { draftToCreateCheckInPayload } from "@/features/sip/sip.helpers";
import { useSipDraftStore } from "@/features/sip/sip.store";
import { uploadApi } from "@/features/upload/upload.api";
import { createImageFormData } from "@/features/upload/upload.helpers";
import { requestCameraPermissionState, requestMediaLibraryPermissionState } from "@/services/camera/camera-permission";
import { pickImageFromLibrary, takePhotoWithCamera } from "@/services/camera/image-picker-service";
import { prefersLibraryOverCamera } from "@/services/platform/device-platform";
import { getCameraGuidance, getMediaLibraryGuidance } from "@/services/platform/permission-guidance";
import { colors, spacing, typography } from "@/theme";
import type { DrinkCategory, SipDraft } from "@/types/domain";

const categoryOptions: { label: string; value: DrinkCategory }[] = [
  { label: "Cocktail", value: "cocktail" },
  { label: "Whisky", value: "whisky" },
  { label: "Wine", value: "wine" },
  { label: "Beer", value: "beer" },
  { label: "Other", value: "other" }
];

const mockCardCopy = {
  title: "Tonight's Sip",
  drinkName: "Negroni",
  barName: "The Botanist",
  note: "Bittersweet, citrus-lit, and ready for a slow second sip."
};

export default function SipCaptureScreen() {
  const draft = useSipDraftStore((state) => state.draft);
  const updateDraft = useSipDraftStore((state) => state.updateDraft);
  const resetDraft = useSipDraftStore((state) => state.resetDraft);
  const [localPhotoUri, setLocalPhotoUri] = useState<string | undefined>(draft.localPhotoUri);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cardReady, setCardReady] = useState(Boolean(draft.localPhotoUri));
  const [isEditing, setIsEditing] = useState(false);
  const [drinkName, setDrinkName] = useState(draft.drinkName ?? mockCardCopy.drinkName);
  const [barName, setBarName] = useState(draft.barName ?? mockCardCopy.barName);
  const [drinkCategory, setDrinkCategory] = useState<DrinkCategory>(draft.drinkCategory ?? "cocktail");
  const [rating, setRating] = useState(draft.rating ? String(draft.rating) : "4.5");
  const [mood, setMood] = useState(draft.moodTags[0] ?? "citrus");
  const [note, setNote] = useState(draft.vibeMumbling ?? mockCardCopy.note);
  const generationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const publishMutation = useMutation({
    mutationFn: async (currentDraft: SipDraft) => {
      let uploadedPhotoUrl = currentDraft.uploadedPhotoUrl;

      if (!uploadedPhotoUrl && currentDraft.localPhotoUri) {
        const upload = await uploadApi.uploadImage(createImageFormData(currentDraft.localPhotoUri));
        uploadedPhotoUrl = upload.imageUrl;
        updateDraft({ uploadedPhotoUrl });
      }

      return sipApi.createCheckIn(
        draftToCreateCheckInPayload({
          ...currentDraft,
          uploadedPhotoUrl
        })
      );
    },
    onSuccess() {
      resetDraft();
      router.replace("/(tabs)/diary");
    },
    onError(error) {
      Alert.alert("Publish failed", error instanceof Error ? error.message : "Please try again.");
    }
  });

  useEffect(() => () => {
    if (generationTimerRef.current) {
      clearTimeout(generationTimerRef.current);
    }
  }, []);

  async function capturePhoto() {
    const permission = await requestCameraPermissionState();
    if (!permission.granted) {
      const guidance = getCameraGuidance(false);
      Alert.alert(guidance.title, guidance.message, guidance.action === "settings"
        ? [
            { text: "取消", style: "cancel" },
            { text: guidance.actionLabel ?? "打开设置", onPress: () => { void Linking.openSettings(); } }
          ]
        : [{ text: "知道了" }]);
      return;
    }

    const result = await takePhotoWithCamera();
    if (!result.canceled) {
      startCardGeneration(result.assets[0]?.uri);
    }
  }

  async function choosePhoto() {
    const permission = await requestMediaLibraryPermissionState();
    if (!permission.granted && Platform.OS !== "web") {
      const guidance = getMediaLibraryGuidance(false);
      Alert.alert(guidance.title, guidance.message);
      return;
    }

    const result = await pickImageFromLibrary();
    if (!result.canceled) {
      startCardGeneration(result.assets[0]?.uri);
    }
  }

  function startCardGeneration(uri?: string) {
    if (!uri) {
      return;
    }

    if (generationTimerRef.current) {
      clearTimeout(generationTimerRef.current);
    }

    setLocalPhotoUri(uri);
    setIsGenerating(true);
    setCardReady(false);
    setIsEditing(false);
    updateDraft({
      localPhotoUri: uri,
      uploadedPhotoUrl: undefined,
      generatedCardUri: undefined,
      uploadedCardUrl: undefined,
      drinkName,
      drinkCategory,
      barName,
      moodTags: mood ? [mood] : [],
      rating: parseRating(rating),
      vibeMumbling: note,
      cardStyle: "receipt",
      visibility: "private",
      socialStatus: "not_social"
    });
    generationTimerRef.current = setTimeout(() => {
      setIsGenerating(false);
      setCardReady(true);
    }, 850);
  }

  function publish() {
    if (!localPhotoUri) {
      Alert.alert("Photo needed", "Take or upload a photo before publishing.");
      return;
    }

    const nextDraft = {
      ...draft,
      localPhotoUri,
      drinkName: drinkName.trim() || mockCardCopy.drinkName,
      drinkCategory,
      barName: barName.trim() || undefined,
      moodTags: mood.trim() ? [mood.trim()] : [],
      rating: parseRating(rating),
      vibeMumbling: note.trim() || undefined,
      cardStyle: "receipt" as const,
      visibility: "private" as const,
      socialStatus: "not_social" as const
    };

    updateDraft(nextDraft);
    publishMutation.mutate(nextDraft);
  }

  return (
    <ScrollScreen>
      <AppHeader title="Sip" subtitle="Shoot, generate, flip, and publish." />

      {!localPhotoUri ? (
        <View style={styles.capturePanel}>
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={38} color="#faf6ee" />
          </View>
          <Text style={styles.panelTitle}>Start with a drink photo</Text>
          <Text style={styles.panelBody}>
            {prefersLibraryOverCamera()
              ? "手机浏览器建议优先从相册选择；原生 App 可直接拍照。"
              : "Taking or uploading a photo will generate a mock card immediately."}
          </Text>
          <View style={styles.actionRow}>
            {prefersLibraryOverCamera() ? (
              <>
                <Pressable onPress={choosePhoto} style={styles.primaryAction}>
                  <Ionicons name="image-outline" size={18} color="#ffffff" />
                  <Text style={styles.primaryActionText}>相册选择</Text>
                </Pressable>
                <Pressable onPress={capturePhoto} style={styles.secondaryAction}>
                  <Ionicons name="camera-outline" size={18} color="#faf6ee" />
                  <Text style={styles.secondaryActionText}>拍照</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable onPress={capturePhoto} style={styles.primaryAction}>
                  <Ionicons name="camera-outline" size={18} color="#ffffff" />
                  <Text style={styles.primaryActionText}>Camera</Text>
                </Pressable>
                <Pressable onPress={choosePhoto} style={styles.secondaryAction}>
                  <Ionicons name="image-outline" size={18} color="#faf6ee" />
                  <Text style={styles.secondaryActionText}>Upload</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      ) : null}

      {localPhotoUri ? (
        <Pressable
          disabled={!cardReady || isGenerating}
          onPress={() => setIsEditing((current) => !current)}
          style={({ pressed }) => [styles.cardShell, pressed && styles.pressed]}
        >
          {!isEditing ? (
            <GeneratedCardFront imageUri={localPhotoUri} isGenerating={isGenerating} />
          ) : (
            <GeneratedCardBack
              barName={barName}
              drinkCategory={drinkCategory}
              drinkName={drinkName}
              mood={mood}
              note={note}
              rating={rating}
              setBarName={setBarName}
              setDrinkCategory={setDrinkCategory}
              setDrinkName={setDrinkName}
              setMood={setMood}
              setNote={setNote}
              setRating={setRating}
            />
          )}
        </Pressable>
      ) : null}

      {localPhotoUri && cardReady ? (
        <View style={styles.footerActions}>
          <AppButton label={isEditing ? "Show card front" : "Tap card to fill details"} onPress={() => setIsEditing((current) => !current)} variant="secondary" />
          {isEditing ? (
            <AppButton
              label={publishMutation.isPending ? "Publishing..." : "Publish"}
              onPress={publish}
            />
          ) : null}
          <AppButton label="Retake / choose another" onPress={() => {
            setLocalPhotoUri(undefined);
            setCardReady(false);
            setIsEditing(false);
            resetDraft();
          }} variant="secondary" />
        </View>
      ) : null}
    </ScrollScreen>
  );
}

function GeneratedCardFront({ imageUri, isGenerating }: { imageUri: string; isGenerating: boolean }) {
  return (
    <LinearGradient colors={["#2b0e0d", "#0d0706"]} style={styles.generatedCard}>
      <Image source={{ uri: imageUri }} style={styles.cardImage} />
      <View style={styles.cardScrim} />
      <View style={styles.cardContent}>
        <Text style={styles.cardEyebrow}>MOCK GENERATED CARD</Text>
        <Text style={styles.cardTitle}>{mockCardCopy.drinkName}</Text>
        <Text style={styles.cardMeta}>{mockCardCopy.barName}</Text>
        <Text style={styles.cardNote}>{mockCardCopy.note}</Text>
      </View>
      {isGenerating ? (
        <View style={styles.generatingLayer}>
          <ActivityIndicator color="#f9c207" />
          <Text style={styles.generatingText}>Generating card...</Text>
        </View>
      ) : (
        <View style={styles.flipHint}>
          <Ionicons name="sync" size={13} color="#c68334" />
          <Text style={styles.flipHintText}>TAP TO FLIP</Text>
        </View>
      )}
    </LinearGradient>
  );
}

function GeneratedCardBack({
  barName,
  drinkCategory,
  drinkName,
  mood,
  note,
  rating,
  setBarName,
  setDrinkCategory,
  setDrinkName,
  setMood,
  setNote,
  setRating
}: {
  barName: string;
  drinkCategory: DrinkCategory;
  drinkName: string;
  mood: string;
  note: string;
  rating: string;
  setBarName: (value: string) => void;
  setDrinkCategory: (value: DrinkCategory) => void;
  setDrinkName: (value: string) => void;
  setMood: (value: string) => void;
  setNote: (value: string) => void;
  setRating: (value: string) => void;
}) {
  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>Complete the check-in</Text>
      <Field label="Drink">
        <SipInput onChangeText={setDrinkName} value={drinkName} />
      </Field>
      <Field label="Bar">
        <SipInput onChangeText={setBarName} value={barName} />
      </Field>
      <Field label="Category">
        <View style={styles.categoryRow}>
          {categoryOptions.map((item) => {
            const selected = drinkCategory === item.value;

            return (
              <Pressable
                key={item.value}
                onPress={() => setDrinkCategory(item.value)}
                style={[styles.categoryChip, selected && styles.categoryChipSelected]}
              >
                <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Field>
      <View style={styles.twoColumn}>
        <Field label="Rating">
          <SipInput keyboardType="decimal-pad" onChangeText={setRating} value={rating} />
        </Field>
        <Field label="Mood">
          <SipInput onChangeText={setMood} value={mood} />
        </Field>
      </View>
      <Field label="Note">
        <SipInput multiline numberOfLines={3} onChangeText={setNote} style={styles.noteInput} value={note} />
      </Field>
    </View>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function SipInput(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor="#6f6158"
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

function parseRating(value: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return Math.max(1, Math.min(5, parsed));
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }]
  },
  capturePanel: {
    alignItems: "center",
    backgroundColor: "#120605",
    borderColor: "rgba(139, 30, 25, 0.68)",
    borderRadius: 24,
    borderWidth: 1,
    gap: 13,
    padding: 22
  },
  cameraIcon: {
    alignItems: "center",
    backgroundColor: "#bd2b25",
    borderColor: "#c68334",
    borderRadius: 34,
    borderWidth: 3,
    height: 68,
    justifyContent: "center",
    width: 68
  },
  panelTitle: {
    ...typography.heading,
    color: colors.text,
    textAlign: "center"
  },
  panelBody: {
    ...typography.caption,
    color: "#a8988c",
    textAlign: "center"
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%"
  },
  primaryAction: {
    alignItems: "center",
    backgroundColor: "#ff5a45",
    borderRadius: 18,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 54
  },
  primaryActionText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900"
  },
  secondaryAction: {
    alignItems: "center",
    backgroundColor: "#24100e",
    borderColor: "rgba(198, 131, 52, 0.28)",
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 54
  },
  secondaryActionText: {
    color: "#faf6ee",
    fontSize: 15,
    fontWeight: "900"
  },
  cardShell: {
    borderRadius: 28,
    overflow: "hidden"
  },
  generatedCard: {
    aspectRatio: 0.72,
    borderColor: "rgba(198, 131, 52, 0.32)",
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative"
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.78
  },
  cardScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 1, 1, 0.28)"
  },
  cardContent: {
    bottom: 26,
    gap: 8,
    left: 22,
    position: "absolute",
    right: 22
  },
  cardEyebrow: {
    color: "#c68334",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 41
  },
  cardMeta: {
    color: "#faf6ee",
    fontSize: 16,
    fontWeight: "800"
  },
  cardNote: {
    color: "#d0c3b7",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19
  },
  generatingLayer: {
    alignItems: "center",
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 1, 1, 0.72)",
    gap: 10,
    justifyContent: "center"
  },
  generatingText: {
    color: "#faf6ee",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8
  },
  flipHint: {
    alignItems: "center",
    backgroundColor: "rgba(13, 7, 6, 0.82)",
    borderColor: "rgba(198, 131, 52, 0.25)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    position: "absolute",
    right: 16,
    top: 16
  },
  flipHintText: {
    color: "#c68334",
    fontSize: 10,
    fontWeight: "900"
  },
  formCard: {
    backgroundColor: "#120605",
    borderColor: "rgba(139, 30, 25, 0.72)",
    borderRadius: 28,
    borderWidth: 1,
    gap: 14,
    padding: 18
  },
  formTitle: {
    color: "#faf6ee",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28
  },
  field: {
    gap: 7
  },
  fieldLabel: {
    color: "#c68334",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  input: {
    backgroundColor: "#0d0504",
    borderColor: "rgba(74, 23, 21, 0.9)",
    borderRadius: 14,
    borderWidth: 1,
    color: "#faf6ee",
    fontSize: 15,
    fontWeight: "700",
    minHeight: 48,
    paddingHorizontal: 13,
    paddingVertical: 10
  },
  noteInput: {
    minHeight: 86,
    textAlignVertical: "top"
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  categoryChip: {
    backgroundColor: "#1b0908",
    borderColor: "rgba(74, 23, 21, 0.9)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9
  },
  categoryChipSelected: {
    backgroundColor: "#bd2b25",
    borderColor: "#e0443d"
  },
  categoryChipText: {
    color: "#a8988c",
    fontSize: 12,
    fontWeight: "900"
  },
  categoryChipTextSelected: {
    color: "#fff4ec"
  },
  twoColumn: {
    flexDirection: "row",
    gap: spacing.md
  },
  footerActions: {
    gap: spacing.sm
  }
});
