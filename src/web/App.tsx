import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Camera,
  ChevronDown,
  ChevronUp,
  Compass,
  Heart,
  Image,
  LocateFixed,
  LogOut,
  Map as MapIcon,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Star,
  TestTube2,
  User,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/features/auth/auth.api";
import { useAuthStore } from "@/features/auth/auth.store";
import { getLocalSessionUser, saveLocalSessionUser, clearLocalSessionUser } from "@/features/auth/local-session";
import { useNearbyBarsQuery } from "@/features/bars/bars.queries";
import { chatApi } from "@/features/chat/chat.api";
import { useConversationMessagesQuery, useConversationsQuery } from "@/features/chat/chat.queries";
import { useDiaryCalendarQuery, useDiarySummaryQuery, useRecentSipsQuery } from "@/features/diary/diary.queries";
import { useGalleryFeedQuery } from "@/features/gallery/gallery.queries";
import { galleryApi } from "@/features/gallery/gallery.api";
import { useMatchCandidatesQuery } from "@/features/match/match.queries";
import { matchApi } from "@/features/match/match.api";
import type { MatchCandidate } from "@/features/match/match.types";
import { createDrunkTiResult, drunkTiQuestions, type DrunkTiResult } from "@/features/persona/drunkti";
import { useDrunkTiStore } from "@/features/persona/drunkti.store";
import { sipApi } from "@/features/sip/sip.api";
import { uploadApi } from "@/features/upload/upload.api";
import { createImageFormData } from "@/features/upload/upload.helpers";
import { diaryFilterOptions, filterDiaryLogs, getDiaryAnchorDate, getSelectedDiaryDay, type DiaryFilterKey } from "@/web/diary-utils";
import { clearTokens, setAccessToken, setRefreshToken } from "@/services/storage/token-storage";
import { createMapRegionForCoordinates, createNearbyBarsParams, defaultDiscoveryCoordinates } from "@/services/location/map-region";
import { calculateDistanceMeters } from "@/services/location/geo-utils";
import type { Bar, CheckIn, DrinkCategory, SipDraft, User as UserType } from "@/types/domain";
import { formatDistance, formatRating } from "@/utils/format";

type TabKey = "diary" | "map" | "sip" | "me";
type DiscoverMode = "bars" | "community" | "match";
type Coordinates = { lat: number; lng: number };

const drinkCategories: DrinkCategory[] = ["cocktail", "whisky", "wine", "beer", "other"];

export function App() {
  const [tab, setTab] = useState<TabKey>("diary");
  const [splashProgress, setSplashProgress] = useState(0);
  const [isSplashMounted, setIsSplashMounted] = useState(true);
  const [isSplashFading, setIsSplashFading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    void getLocalSessionUser().then((saved) => {
      if (saved) {
        setUser(saved);
      }
    });
  }, [setUser]);

  useEffect(() => {
    let frameId = 0;
    let startTimestamp: number | null = null;
    const duration = 2800;

    const animate = (timestamp: number) => {
      startTimestamp ??= timestamp;
      const nextProgress = Math.min(((timestamp - startTimestamp) / duration) * 100, 100);
      setSplashProgress(nextProgress);

      if (nextProgress < 100) {
        frameId = window.requestAnimationFrame(animate);
        return;
      }

      window.setTimeout(() => {
        setIsSplashFading(true);
        window.setTimeout(() => setIsSplashMounted(false), 700);
      }, 500);
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  if (isSplashMounted) {
    return <SplashScreen fading={isSplashFading} progress={splashProgress} />;
  }

  if (!user) {
    return <LoginScreen onAuthed={(nextUser) => {
      setUser(nextUser);
      setTab("diary");
    }} />;
  }

  return (
    <div className="app-shell">
      <main className="phone-frame">
        {tab === "diary" ? <DiaryScreen /> : null}
        {tab === "map" ? <DiscoverScreen /> : null}
        {tab === "sip" ? <SipScreen onPublished={() => setTab("diary")} /> : null}
        {tab === "me" ? <MeScreen user={user} onLogout={async () => {
          await clearTokens();
          await clearLocalSessionUser();
          setUser(null);
        }} /> : null}
      </main>
      <nav className="tabbar" aria-label="Main navigation">
        <TabButton active={tab === "diary"} icon={<BookOpen />} label="Diary" onClick={() => setTab("diary")} />
        <TabButton active={tab === "map"} icon={<MapIcon />} label="Map" onClick={() => setTab("map")} />
        <button className="sip-tab" type="button" aria-label="Open camera check-in" onClick={() => setTab("sip")}>
          <Camera />
        </button>
        <TabButton active={tab === "me"} icon={<User />} label="Me" onClick={() => setTab("me")} />
      </nav>
    </div>
  );
}

function SplashScreen({ fading, progress }: { fading: boolean; progress: number }) {
  const backWaveY = 73.5 - (progress / 100) * 38;
  const frontWaveY = 73.5 - (progress / 100) * 37.3;

  return (
    <div className={`splash-screen ${fading ? "is-fading" : ""}`}>
      <div className="splash-brand">
        <span>DRUNK TO NITE</span>
        <i />
      </div>

      <div className="splash-loader" style={{ "--progress": progress } as CSSProperties}>
        <div className="splash-aura" />
        <svg viewBox="0 0 100 120" aria-hidden="true" className="splash-cocktail">
          <g transform="translate(19, 34) rotate(-30) scale(0.55)">
            <path d="M -22,0 A 22,22 0 0,1 22,0 Z" fill="#F9C207" />
            <path d="M -19.5,0 A 19.5,19.5 0 0,1 19.5,0 Z" fill="#FAF6EE" />
            <path d="M -17.5,0 A 17.5,17.5 0 0,1 17.5,0 Z" fill="#FFE169" />
            <line x1="0" y1="0" x2="-14.16" y2="-10.29" stroke="#FAF6EE" strokeWidth="1.2" />
            <line x1="0" y1="0" x2="-5.41" y2="-16.64" stroke="#FAF6EE" strokeWidth="1.2" />
            <line x1="0" y1="0" x2="5.41" y2="-16.64" stroke="#FAF6EE" strokeWidth="1.2" />
            <line x1="0" y1="0" x2="14.16" y2="-10.29" stroke="#FAF6EE" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="2.5" fill="#FAF6EE" />
          </g>
          <defs>
            <clipPath id="splash-liquid-cup-cavity">
              <polygon points="21.5,36.2 50,73.5 78.5,36.2" />
            </clipPath>
          </defs>
          <g clipPath="url(#splash-liquid-cup-cavity)">
            <path
              className="splash-wave-back"
              d={`M 0,${backWaveY} C 25,${backWaveY + 2.5} 50,${backWaveY - 2.5} 75,${backWaveY} C 100,${backWaveY + 2.5} 125,${backWaveY - 2.5} 150,${backWaveY} C 175,${backWaveY + 2.5} 200,${backWaveY - 2.5} 225,${backWaveY} L 225,120 L 0,120 Z`}
              fill="#C68334"
              opacity="0.45"
            />
            <path
              className="splash-wave-front"
              d={`M 0,${frontWaveY} C 25,${frontWaveY - 3.2} 50,${frontWaveY + 3.2} 75,${frontWaveY} C 100,${frontWaveY - 3.2} 125,${frontWaveY + 3.2} 150,${frontWaveY} C 175,${frontWaveY - 3.2} 200,${frontWaveY + 3.2} 225,${frontWaveY} L 225,120 L 0,120 Z`}
              fill="#FAF6EE"
            />
          </g>
          <line x1="20" y1="35" x2="80" y2="35" stroke="#FAF6EE" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />
          <polygon points="20,35 50,75 80,35" stroke="#FAF6EE" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="50" y1="75" x2="50" y2="105" stroke="#FAF6EE" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M 33,105 L 67,105" stroke="#FAF6EE" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
        <div className="splash-meter">
          <strong>{Math.round(progress)}%</strong>
          <span>{progress === 100 ? "Ready - Enjoy Tonight" : "Pouring and chilling..."}</span>
        </div>
      </div>

      <h1>BarLog</h1>
      <p className="splash-quote">Let your emotions brew tonight</p>
      <small>BARLOG COCKTAIL DIARY 2026</small>
    </div>
  );
}

function LoginScreen({ onAuthed }: { onAuthed: (user: UserType) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    const nextEmail = email.trim().toLowerCase();
    const nextName = displayName.trim() || nextEmail.split("@")[0];

    if (!nextEmail.includes("@") || password.length < 6) {
      setMessage("Use a valid email and a password with at least 6 characters.");
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const response = mode === "login"
        ? await authApi.login({ email: nextEmail, password })
        : await authApi.register({ displayName: nextName, email: nextEmail, password });
      const nextUser = { ...response.user, email: response.user.email ?? nextEmail };
      await setAccessToken(response.accessToken);
      if (response.refreshToken) {
        await setRefreshToken(response.refreshToken);
      }
      await saveLocalSessionUser(nextUser);
      onAuthed(nextUser);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to authenticate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="brand-block">
        <p className="eyebrow">ALCOLHOL% PORTAL</p>
        <h1>BarLog</h1>
        <span />
      </div>
      <section className="auth-card">
        <div className="switcher">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">Login</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")} type="button">Register</button>
        </div>
        {mode === "register" ? (
          <label className="field">
            <span>Tonight Name</span>
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Crimson Guest" />
          </label>
        ) : null}
        <label className="field">
          <span>Email Address</span>
          <input autoCapitalize="none" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="demo@barlog.app" />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="password123" />
        </label>
        {message ? <p className="inline-error">{message}</p> : null}
        <button className="primary-button" disabled={loading} onClick={submit} type="button">
          {loading ? "POURING INSPIRATION..." : mode === "login" ? "ENTER BARLOG" : "CREATE NIGHT ID"}
        </button>
      </section>
    </div>
  );
}

function DiaryScreen() {
  const month = useCurrentMonth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<DiaryFilterKey>("all");
  const [isDrunkTiOpen, setIsDrunkTiOpen] = useState(false);
  const drunkTiResult = useDrunkTiStore((state) => state.result);
  const setDrunkTiResult = useDrunkTiStore((state) => state.setResult);
  const summary = useDiarySummaryQuery(month);
  const calendar = useDiaryCalendarQuery(month);
  const recent = useRecentSipsQuery();
  const logs = recent.data?.items ?? [];
  const visibleLogs = filterDiaryLogs(logs, { category: activeFilter, search, selectedDate });

  return (
    <Screen title="Diary" subtitle="Your personal drinking archive.">
      <div className="diary-actions">
        <button className="drunkti-button" type="button" onClick={() => setIsDrunkTiOpen(true)}>
          <TestTube2 size={14} />
          DrunkTI
          {drunkTiResult ? <span>{drunkTiResult.code}</span> : null}
        </button>
      </div>
      <div className="stats-grid">
        <Stat label="TOTAL LOGS" value={summary.isLoading ? "..." : String(summary.data?.checkInCount ?? 0)} />
        <Stat label="EXPLORED" value={summary.isLoading ? "..." : String(summary.data?.barsVisited ?? 0)} />
        <Stat label="AVG RATING" value={summary.isLoading ? "..." : summary.data?.averageRating?.toFixed(1) ?? "-"} />
      </div>
      <CalendarStrip
        days={Array.isArray(calendar.data) ? calendar.data : []}
        isLoading={calendar.isLoading}
        logs={logs}
        month={month}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <div className="search-box">
        <Search size={16} />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search drinks, bars, or diary notes..." />
        {search ? <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><X size={15} /></button> : null}
      </div>
      <div className="filter-row" aria-label="Drink filters">
        {diaryFilterOptions.map((option) => (
          <button
            key={option.key}
            className={activeFilter === option.key ? "active" : ""}
            type="button"
            onClick={() => setActiveFilter(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {recent.isLoading ? <StatusCard label="Loading recent sips" /> : null}
      {recent.isError ? <StatusCard tone="error" label={recent.error.message} /> : null}
      <div className="stack">
        {visibleLogs.map((sip) => <LogCard key={sip.id} sip={sip} />)}
        {!recent.isLoading && !visibleLogs.length ? <StatusCard label="No matching logs returned." /> : null}
      </div>
      <DrunkTiModal
        onClose={() => setIsDrunkTiOpen(false)}
        onSave={(result) => {
          setDrunkTiResult(result);
          setIsDrunkTiOpen(false);
        }}
        visible={isDrunkTiOpen}
      />
    </Screen>
  );
}

function DiscoverScreen() {
  const [mode, setMode] = useState<DiscoverMode>("bars");
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const referenceCoords = coords ?? defaultDiscoveryCoordinates;
  const params = useMemo(() => createNearbyBarsParams(referenceCoords), [referenceCoords]);
  const nearby = useNearbyBarsQuery(params, { enabled: mode === "bars" });
  const bars = (nearby.data?.items ?? []).map((bar) => ({
    ...bar,
    displayDistanceMeters: typeof bar.lat === "number" && typeof bar.lng === "number"
      ? calculateDistanceMeters(referenceCoords, { lat: bar.lat, lng: bar.lng })
      : bar.distanceMeters
  }));
  const region = createMapRegionForCoordinates(referenceCoords, nearby.data?.items ?? []);

  useEffect(() => {
    if (mode === "bars") {
      void requestLocation(setCoords, setLocating, setLocationError);
    }
  }, []);

  return (
    <Screen title="Discover" subtitle="Bars, community, and matches powered by backend data.">
      <div className="segmented">
        <button className={mode === "bars" ? "active" : ""} onClick={() => setMode("bars")} type="button">Bars</button>
        <button className={mode === "community" ? "active" : ""} onClick={() => setMode("community")} type="button">Community</button>
        <button className={mode === "match" ? "active" : ""} onClick={() => setMode("match")} type="button">Match</button>
      </div>
      {mode === "bars" ? (
        <>
          <SectionLabel icon={<Compass size={17} />} label="MICRO BAR MAP" />
          <MapPreview bars={bars} region={region} userCoordinate={referenceCoords} />
          {!coords ? <StatusCard label="Showing the default Shanghai map until browser location permission is available." /> : null}
          <button className="permission-button" type="button" onClick={() => requestLocation(setCoords, setLocating, setLocationError)}>
            <LocateFixed size={16} />
            {locating ? "Finding your location..." : coords ? "Refresh current location" : "Allow location for nearby bars"}
          </button>
          {locationError ? <PermissionNotice message={locationError} /> : null}
          {nearby.isLoading ? <StatusCard label="Loading nearby bars" /> : null}
          {nearby.isError ? <StatusCard tone="error" label={nearby.error.message} /> : null}
          <div className="stack">
            {bars.map((bar, index) => (
              <BarCard key={bar.id} bar={bar} index={index} expanded={expanded === bar.id} onToggle={() => setExpanded((current) => current === bar.id ? null : bar.id)} />
            ))}
            {!nearby.isLoading && !bars.length ? <StatusCard label={nearby.data?.message ?? "No bars returned near this location."} /> : null}
          </div>
        </>
      ) : mode === "community" ? (
        <CommunityFeed />
      ) : (
        <MatchPanel />
      )}
    </Screen>
  );
}

function SipScreen({ onPublished }: { onPublished: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<{ url: string; blob: Blob } | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [drinkName, setDrinkName] = useState("Negroni");
  const [barName, setBarName] = useState("The Botanist");
  const [category, setCategory] = useState<DrinkCategory>("cocktail");
  const [rating, setRating] = useState("4.5");
  const [mood, setMood] = useState("citrus");
  const [note, setNote] = useState("Bittersweet, citrus-lit, and ready for a slow second sip.");
  const publish = useMutation({
    mutationFn: async () => {
      if (!photo) {
        throw new Error("Take or upload a photo before publishing.");
      }
      const upload = await uploadApi.uploadImage(createImageFormData(photo.blob, "sip.jpg", photo.blob.type || "image/jpeg"));
      const draft: SipDraft = {
        localPhotoUri: photo.url,
        uploadedPhotoUrl: upload.imageUrl,
        drinkName: drinkName.trim() || "Tonight's Sip",
        drinkCategory: category,
        barName: barName.trim() || undefined,
        moodTags: mood.trim() ? [mood.trim()] : [],
        rating: clampRating(rating),
        vibeMumbling: note.trim() || undefined,
        cardStyle: "receipt",
        visibility: "private",
        socialStatus: "not_social"
      };
      return sipApi.createCheckIn({
        photoUrl: draft.uploadedPhotoUrl!,
        drinkName: draft.drinkName!,
        drinkCategory: draft.drinkCategory!,
        barName: draft.barName,
        moodTags: draft.moodTags,
        rating: draft.rating,
        vibeMumbling: draft.vibeMumbling,
        cardStyle: draft.cardStyle,
        visibility: draft.visibility,
        socialStatus: draft.socialStatus
      });
    },
    onSuccess: onPublished
  });

  useEffect(() => {
    void startCamera();
    return () => stopCamera(streamRef.current);
  }, []);

  async function startCamera() {
    setPermissionError(null);
    if (!window.isSecureContext) {
      setPermissionError("Live camera preview requires HTTPS on mobile browsers. Use Upload for the system camera, or open the PWA through an HTTPS tunnel.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionError("This browser does not expose live camera preview. Use Upload as the system camera fallback.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1440 }, height: { ideal: 1920 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch {
      setPermissionError("Camera permission is blocked or unavailable. Allow camera access in the browser, or upload a photo.");
      setCameraReady(false);
    }
  }

  function captureFrame() {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1080;
    canvas.height = video.videoHeight || 1440;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      setPhoto({ blob, url: URL.createObjectURL(blob) });
      setFlipped(false);
      stopCamera(streamRef.current);
      setCameraReady(false);
    }, "image/jpeg", 0.92);
  }

  function chooseFile(file?: File) {
    if (!file) {
      return;
    }
    setPhoto({ blob: file, url: URL.createObjectURL(file) });
    setFlipped(false);
  }

  return (
    <Screen title="Sip" subtitle="Shoot, generate, flip, and publish.">
      <input ref={fileInputRef} className="hidden-input" type="file" accept="image/*" onChange={(event) => chooseFile(event.target.files?.[0])} />
      {!photo ? (
        <section className="capture-panel">
          <div className={`camera-live ${cameraReady ? "is-live" : ""}`}>
            <video ref={videoRef} playsInline muted />
            {!cameraReady ? (
              <div className="camera-placeholder">
                <Camera size={48} />
                <span>{permissionError ? "Preview unavailable" : "Opening camera preview..."}</span>
              </div>
            ) : null}
          </div>
          {permissionError ? <PermissionNotice message={permissionError} /> : null}
          <div className="action-grid">
            <button className="primary-button" type="button" onClick={cameraReady ? captureFrame : startCamera}>
              <Camera size={17} />
              {cameraReady ? "Capture" : "Camera"}
            </button>
            <button className="secondary-button" type="button" onClick={() => fileInputRef.current?.click()}>
              <Image size={17} />
              Upload
            </button>
          </div>
        </section>
      ) : (
        <>
          <button className="generated-card" type="button" onClick={() => setFlipped((current) => !current)}>
            {!flipped ? (
              <>
                <img src={photo.url} alt="Captured drink" />
                <div className="card-copy">
                  <p>MOCK GENERATED CARD</p>
                  <h2>{drinkName}</h2>
                  <span>{barName}</span>
                  <small>{note}</small>
                </div>
                <div className="flip-hint"><RefreshCw size={13} /> TAP TO FLIP</div>
              </>
            ) : (
              <div className="card-form" onClick={(event) => event.stopPropagation()}>
                <h2>Complete the check-in</h2>
                <Field label="Drink"><input value={drinkName} onChange={(event) => setDrinkName(event.target.value)} /></Field>
                <Field label="Bar"><input value={barName} onChange={(event) => setBarName(event.target.value)} /></Field>
                <div className="chip-row">
                  {drinkCategories.map((item) => (
                    <button key={item} className={category === item ? "active" : ""} type="button" onClick={() => setCategory(item)}>{item}</button>
                  ))}
                </div>
                <div className="two-fields">
                  <Field label="Rating"><input inputMode="decimal" value={rating} onChange={(event) => setRating(event.target.value)} /></Field>
                  <Field label="Mood"><input value={mood} onChange={(event) => setMood(event.target.value)} /></Field>
                </div>
                <Field label="Note"><textarea value={note} onChange={(event) => setNote(event.target.value)} /></Field>
              </div>
            )}
          </button>
          {publish.isError ? <StatusCard tone="error" label={publish.error.message} /> : null}
          <div className="action-grid vertical">
            <button className="secondary-button" type="button" onClick={() => setFlipped((current) => !current)}>
              {flipped ? "Show card front" : "Tap card to fill details"}
            </button>
            {flipped ? <button className="primary-button" type="button" disabled={publish.isPending} onClick={() => publish.mutate()}>{publish.isPending ? "Publishing..." : "Publish"}</button> : null}
            <button className="secondary-button" type="button" onClick={() => setPhoto(null)}>Retake / choose another</button>
          </div>
        </>
      )}
    </Screen>
  );
}

function MeScreen({ user, onLogout }: { user: UserType; onLogout: () => void }) {
  const drunkTiResult = useDrunkTiStore((state) => state.result);

  return (
    <Screen title="Me" subtitle="Profile, settings, and local PWA state.">
      <section className="profile-card">
        <div className="avatar">{user.displayName.slice(0, 1).toUpperCase()}</div>
        <h2>{user.displayName}</h2>
        <p>{user.email ?? "No email returned"}</p>
        <div className="profile-drunk-ti">
          {drunkTiResult ? (
            <>
              <span>DrunkTI</span>
              <strong>{drunkTiResult.code} 路 {drunkTiResult.name}</strong>
              <p>{drunkTiResult.tagline}</p>
              <div className="profile-drunk-ti-stats">
                {drunkTiResult.stats.map((stat) => (
                  <i key={stat.label} style={{ "--stat-color": stat.color, "--stat-value": `${stat.value}%` } as CSSProperties}>
                    <b>{stat.label}</b>
                    <em><span /></em>
                    <small>{stat.value}</small>
                  </i>
                ))}
              </div>
            </>
          ) : (
            <>
              <span>DrunkTI</span>
              <strong>Not tested yet</strong>
              <p>Finish DrunkTI from Diary to show your drinking archetype here.</p>
            </>
          )}
        </div>
      </section>
      <button className="secondary-button" type="button" onClick={onLogout}>
        <LogOut size={16} />
        Log out
      </button>
    </Screen>
  );
}

function CommunityFeed() {
  const feed = useGalleryFeedQuery({ city: "Shanghai", range: "24h" });
  const [likedPosts, setLikedPosts] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(window.localStorage.getItem("barlog.community.likedPosts") ?? "[]"));
    } catch {
      return new Set();
    }
  });
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const like = useMutation({
    mutationFn: (postId: string) => galleryApi.likePost(postId),
    onError: (_error, postId) => {
      setLikedPosts((current) => {
        const next = new Set(current);
        if (next.has(postId)) {
          next.delete(postId);
        } else {
          next.add(postId);
        }
        return next;
      });
    }
  });

  const toggleLike = (postId: string) => {
    setLikedPosts((current) => {
      const next = new Set(current);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
    like.mutate(postId);
  };

  useEffect(() => {
    window.localStorage.setItem("barlog.community.likedPosts", JSON.stringify([...likedPosts]));
  }, [likedPosts]);

  return (
    <>
      <SectionLabel icon={<Sparkles size={17} />} label="COMMUNITY GALLERY" />
      {feed.isLoading ? <StatusCard label="Loading community feed" /> : null}
      {feed.isError ? <StatusCard tone="error" label={feed.error.message} /> : null}
      <div className="feed-grid">
        {(feed.data?.items ?? []).map((post) => {
          const liked = likedPosts.has(post.id) || Boolean(("likedByMe" in post && post.likedByMe) || ("likedByCurrentUser" in post && post.likedByCurrentUser));
          const likeCount = post.likedCount + (liked ? 1 : 0);
          const imageSrc = getCommunityPostImage(post);
          const imageFailed = failedImages.has(post.id);

          return (
            <article className="feed-card" key={post.id}>
              {imageSrc && !imageFailed ? (
                <img
                  className="feed-card-photo"
                  src={imageSrc}
                  alt={post.caption ?? post.barName ?? "Check-in photo"}
                  onError={() => {
                    setFailedImages((current) => new Set(current).add(post.id));
                  }}
                />
              ) : (
                <div className="feed-card-photo feed-card-photo-fallback">
                  <Image size={22} />
                  <span>Check-in Photo</span>
                </div>
              )}
              <div className="feed-card-body">
                <div className="feed-card-top">
                  <span>
                    <strong>{post.authorName}</strong>
                    <small>{post.barName ?? post.city ?? "Tonight"}</small>
                  </span>
                  <button
                    aria-label={liked ? "Unlike check-in" : "Like check-in"}
                    className={liked ? "liked" : ""}
                    disabled={like.isPending}
                    onClick={() => toggleLike(post.id)}
                    type="button"
                  >
                    <Heart size={15} fill={liked ? "currentColor" : "none"} />
                    {likeCount}
                  </button>
                </div>
                {post.caption ? <p>{post.caption}</p> : null}
              </div>
            </article>
          );
        })}
      </div>
      {!feed.isLoading && !(feed.data?.items ?? []).length ? <StatusCard label="No community posts returned." /> : null}
    </>
  );
}

type CommunityImagePost = {
  cardImageUrl?: string;
  checkIn?: CommunityImagePost;
  checkInPhotoUrl?: string;
  generatedCardUri?: string;
  imageUrl?: string;
  images?: string[];
  likedByMe?: boolean;
  likedByCurrentUser?: boolean;
  mediaUrl?: string;
  photo?: string;
  photoUrl?: string;
  photos?: string[];
  thumbnailUrl?: string;
  uploadedPhotoUrl?: string;
};

function getCommunityPostImage(post: CommunityImagePost): string {
  return post.imageUrl ||
    post.photoUrl ||
    post.checkInPhotoUrl ||
    post.mediaUrl ||
    post.thumbnailUrl ||
    post.photo ||
    post.cardImageUrl ||
    post.uploadedPhotoUrl ||
    post.generatedCardUri ||
    post.images?.[0] ||
    post.photos?.[0] ||
    (post.checkIn ? getCommunityPostImage(post.checkIn) : "");
}

function MatchPanel() {
  const candidates = useMatchCandidatesQuery();
  const conversations = useConversationsQuery();
  const [activeCandidate, setActiveCandidate] = useState<MatchCandidate | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [localMessages, setLocalMessages] = useState<Record<string, string[]>>({});
  const [savedChatIds, setSavedChatIds] = useState<string[]>(() => {
    try {
      return JSON.parse(window.localStorage.getItem("barlog.match.savedChats") ?? "[]");
    } catch {
      return [];
    }
  });
  const activeConversation = useMemo(() => {
    if (!activeCandidate) {
      return null;
    }

    const candidateName = activeCandidate.displayName.toLowerCase();
    return (conversations.data?.items ?? []).find((conversation) =>
      conversation.title.toLowerCase().includes(candidateName)
    ) ?? null;
  }, [activeCandidate, conversations.data?.items]);
  const messages = useConversationMessagesQuery(activeConversation?.id ?? "");
  const request = useMutation({
    mutationFn: (candidateId: string) => matchApi.requestMatch(candidateId),
    onSuccess: () => {
      void conversations.refetch();
    }
  });
  const sendMessage = useMutation({
    mutationFn: ({ body, conversationId }: { body: string; conversationId: string }) =>
      chatApi.sendMessage(conversationId, body),
    onSuccess: () => {
      setMessageDraft("");
      void messages.refetch();
      void conversations.refetch();
    }
  });
  const orderedCandidates = useMemo(() => {
    const items = candidates.data ?? [];
    const savedOrder = new Map(savedChatIds.map((id, index) => [id, index]));

    return [...items].sort((first, second) => {
      const firstSaved = savedOrder.get(first.id);
      const secondSaved = savedOrder.get(second.id);

      if (firstSaved !== undefined && secondSaved !== undefined) {
        return firstSaved - secondSaved;
      }
      if (firstSaved !== undefined) {
        return -1;
      }
      if (secondSaved !== undefined) {
        return 1;
      }
      return 0;
    });
  }, [candidates.data, savedChatIds]);
  const savedCandidates = savedChatIds
    .map((id) => (candidates.data ?? []).find((candidate) => candidate.id === id))
    .filter((candidate): candidate is MatchCandidate => Boolean(candidate));

  useEffect(() => {
    window.localStorage.setItem("barlog.match.savedChats", JSON.stringify(savedChatIds));
  }, [savedChatIds]);

  const openChat = (candidate: MatchCandidate) => {
    setActiveCandidate(candidate);
    setSavedChatIds((current) => [candidate.id, ...current.filter((id) => id !== candidate.id)].slice(0, 3));
    if (!conversations.data?.items.some((conversation) => conversation.title.toLowerCase().includes(candidate.displayName.toLowerCase()))) {
      request.mutate(candidate.id);
    }
  };

  const submitMessage = () => {
    const body = messageDraft.trim();
    if (!body || !activeCandidate) {
      return;
    }

    if (activeConversation) {
      sendMessage.mutate({ body, conversationId: activeConversation.id });
      return;
    }

    setLocalMessages((current) => ({
      ...current,
      [activeCandidate.id]: [...(current[activeCandidate.id] ?? []), body]
    }));
    setMessageDraft("");
  };

  if (activeCandidate) {
    return (
      <section className="match-chat-page" aria-label={`Chat with ${activeCandidate.displayName}`}>
        <div className="match-chat-head">
          <button className="match-chat-back" type="button" onClick={() => setActiveCandidate(null)} aria-label="Back to matches">
            <ArrowLeft size={16} />
          </button>
          <div className="match-chat-person">
            <div className="match-chat-avatar">
              {activeCandidate.avatarUrl ? <img src={activeCandidate.avatarUrl} alt="" /> : activeCandidate.displayName.slice(0, 1).toUpperCase()}
            </div>
            <span>
              <strong>{activeCandidate.displayName}</strong>
              <small>{activeConversation ? "Conversation open" : request.isPending ? "Sending a clink..." : "Clink room"}</small>
            </span>
          </div>
        </div>
        <div className="match-message-list">
          {messages.isLoading ? <StatusCard label="Loading messages" /> : null}
          {messages.isError ? <StatusCard tone="error" label={messages.error.message} /> : null}
          {activeConversation
            ? (messages.data?.items ?? []).map((message) => (
              <p key={message.id} className={message.senderId === activeCandidate.id ? "theirs" : "mine"}>
                {message.body}
              </p>
            ))
            : null}
          {(localMessages[activeCandidate.id] ?? []).map((body, index) => (
            <p key={`${activeCandidate.id}-${index}`} className="mine">{body}</p>
          ))}
          {!activeConversation && !(localMessages[activeCandidate.id] ?? []).length ? (
            <small>{request.isError ? request.error.message : "Clink sent. Start with a low-pressure opener while the match request warms up."}</small>
          ) : null}
          {activeConversation && !messages.isLoading && !(messages.data?.items ?? []).length && !(localMessages[activeCandidate.id] ?? []).length ? (
            <small>No messages yet. Start with a tiny pour.</small>
          ) : null}
        </div>
        <div className="match-chat-compose">
          <input
            autoFocus
            value={messageDraft}
            onChange={(event) => setMessageDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submitMessage();
              }
            }}
            placeholder="Send a low-pressure opener..."
          />
          <button type="button" disabled={!messageDraft.trim() || sendMessage.isPending} onClick={submitMessage}>
            <Send size={15} />
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <SectionLabel icon={<Sparkles size={17} />} label="TONIGHT MATCH" />
      {candidates.isLoading ? <StatusCard label="Loading nearby drinking buddies" /> : null}
      {candidates.isError ? <StatusCard tone="error" label={candidates.error.message} /> : null}
      {savedCandidates.length ? (
        <section className="match-saved-strip" aria-label="Recent clinks">
          <strong>RECENT CLINKS</strong>
          <div>
            {savedCandidates.map((candidate) => (
              <button key={candidate.id} type="button" onClick={() => openChat(candidate)}>
                <span className="match-saved-avatar">
                  {candidate.avatarUrl ? <img src={candidate.avatarUrl} alt="" /> : candidate.displayName.slice(0, 1).toUpperCase()}
                </span>
                {candidate.displayName}
              </button>
            ))}
          </div>
        </section>
      ) : null}
      <div className="stack">
        {orderedCandidates.map((candidate) => (
          <article className="match-card" key={candidate.id}>
            <div className="match-avatar">
              {candidate.avatarUrl ? <img src={candidate.avatarUrl} alt="" /> : candidate.displayName.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <strong>{candidate.displayName}</strong>
              {candidate.reason ? <span>{candidate.reason}</span> : null}
              {typeof candidate.distanceMeters === "number" ? <small>{formatDistance(candidate.distanceMeters)} away</small> : null}
              <button className="match-chat-button" type="button" onClick={() => openChat(candidate)}>
                <MessageCircle size={14} />
                Clink
              </button>
            </div>
          </article>
        ))}
        {!candidates.isLoading && !(candidates.data ?? []).length ? <StatusCard label="No match candidates returned." /> : null}
      </div>
    </>
  );
}

function MapPreview({ bars, region, userCoordinate }: { bars: Array<Bar & { displayDistanceMeters?: number }>; region: ReturnType<typeof createMapRegionForCoordinates>; userCoordinate: Coordinates }) {
  const minLat = region.latitude - region.latitudeDelta / 2;
  const maxLat = region.latitude + region.latitudeDelta / 2;
  const minLng = region.longitude - region.longitudeDelta / 2;
  const maxLng = region.longitude + region.longitudeDelta / 2;
  const project = (point: Coordinates) => ({
    left: `${((point.lng - minLng) / Math.max(maxLng - minLng, 0.0001)) * 100}%`,
    top: `${(1 - (point.lat - minLat) / Math.max(maxLat - minLat, 0.0001)) * 100}%`
  });

  return (
    <div className="map-preview">
      <div className="map-grid" />
      <div className="map-user" style={project(userCoordinate)}><LocateFixed size={14} /></div>
      {bars.filter((bar) => typeof bar.lat === "number" && typeof bar.lng === "number").map((bar, index) => (
        <div className="map-pin" key={bar.id} style={project({ lat: bar.lat!, lng: bar.lng! })}>
          <span>{index + 1}</span>
        </div>
      ))}
    </div>
  );
}

function BarCard({ bar, expanded, index, onToggle }: { bar: Bar & { displayDistanceMeters?: number }; expanded: boolean; index: number; onToggle: () => void }) {
  return (
    <button className="bar-card" onClick={onToggle} type="button">
      <span className="bar-index">{index + 1}</span>
      <span className="bar-body">
        <strong>{bar.name}</strong>
        <span><Star size={13} /> {formatRating(bar.rating)} / {formatDistance(bar.displayDistanceMeters)}</span>
        <small>{bar.area ?? bar.address ?? "No address returned"}</small>
        {expanded ? (
          <em>{bar.address ?? bar.area ?? "No address returned"} · {typeof bar.lat === "number" && typeof bar.lng === "number" ? `${bar.lat.toFixed(5)}, ${bar.lng.toFixed(5)}` : "No coordinates returned"}</em>
        ) : null}
      </span>
      {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
    </button>
  );
}

function Screen({ children, subtitle, title }: { children: ReactNode; subtitle: string; title: string }) {
  return (
    <section className="screen">
      <header className="screen-header">
        <p>BarLog</p>
        <h1>{title}</h1>
        <span>{subtitle}</span>
      </header>
      {children}
    </section>
  );
}

function TabButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return <button className={active ? "active" : ""} type="button" onClick={onClick}>{icon}<span>{label}</span></button>;
}

function SectionLabel({ icon, label }: { icon: ReactNode; label: string }) {
  return <div className="section-label">{icon}<span>{label}</span><i /></div>;
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="stat-card"><Sparkles size={16} /><strong>{value}</strong><span>{label}</span></div>;
}

function CalendarStrip({
  days,
  isLoading,
  logs,
  month,
  onSelectDate,
  selectedDate
}: {
  days: { date: string; count: number }[];
  isLoading: boolean;
  logs: CheckIn[];
  month: string;
  onSelectDate: (date: string | null) => void;
  selectedDate: string | null;
}) {
  const monthDate = new Date(`${month}-01T12:00:00`);
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const countByDate = new Map(days.map((day) => [day.date, day.count]));
  const anchorDate = getDiaryAnchorDate(month);
  const selectedDay = getSelectedDiaryDay(logs, selectedDate, countByDate);
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    anchorRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [anchorDate, daysInMonth]);

  return (
    <section className="calendar-card">
      <strong>{monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase()} DRINKING DAYS</strong>
      <div className="rope-scroll">
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const date = `${month}-${String(day).padStart(2, "0")}`;
          const selected = selectedDate === date;
          const hasLog = (countByDate.get(date) ?? 0) > 0;
          return (
            <button
              key={date}
              ref={date === anchorDate ? anchorRef : null}
              className={`${hasLog ? "has-log" : ""} ${selected ? "selected" : ""}`}
              type="button"
              onClick={() => onSelectDate(selected ? null : date)}
            >
              <span />
              {day}
              {selected ? <em>DAY {day}</em> : null}
            </button>
          );
        })}
      </div>
      {isLoading ? <p className="calendar-loading">Loading monthly knots...</p> : null}
      {selectedDay ? (
        <article className="day-info-card">
          <div className="day-info-top">
            <div>
              <i />
              <strong>{selectedDay.dateLabel}</strong>
              <span>LOCKED</span>
            </div>
            <b>{getDrinkEmoji("beer")} GOT {selectedDay.count} DRINKS</b>
          </div>
          <hr />
          {selectedDay.logs.length ? (
            selectedDay.logs.slice(0, 4).map((sip) => (
              <div className="day-drink-row" key={sip.id}>
                <span>{getDrinkEmoji(sip.drinkCategory)}</span>
                <strong>{sip.drinkName}</strong>
                <em>@{sip.barName ?? sip.area ?? sip.city ?? "Unknown"}</em>
              </div>
            ))
          ) : (
            <p className="day-info-empty">No logs returned for this date yet.</p>
          )}
          <small>Click day again to unlock</small>
        </article>
      ) : null}
    </section>
  );
}

function DrunkTiModal({
  onClose,
  onSave,
  visible
}: {
  onClose: () => void;
  onSave: (result: DrunkTiResult) => void;
  visible: boolean;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const currentQuestion = drunkTiQuestions[step];
  const progress = ((step + 1) / drunkTiQuestions.length) * 100;

  if (!visible) {
    return null;
  }

  const choose = (axis: string, value: string) => {
    const nextAnswers = { ...answers, [axis]: value };
    setAnswers(nextAnswers);

    if (step < drunkTiQuestions.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    onSave(createDrunkTiResult(nextAnswers));
    setStep(0);
    setAnswers({});
  };

  const close = () => {
    setStep(0);
    setAnswers({});
    onClose();
  };

  return (
    <div className="modal-scrim" role="dialog" aria-modal="true" aria-label="DrunkTI test">
      <section className="drunkti-modal">
        <div className="modal-topbar">
          <strong>DRINKING MBTI TEST</strong>
          <button type="button" onClick={close} aria-label="Close DrunkTI"><X size={17} /></button>
        </div>
        <div className="progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="question-block">
          <span>STEP {step + 1} OF {drunkTiQuestions.length}</span>
          <h2>{currentQuestion.text}</h2>
        </div>
        <div className="answer-list">
          {currentQuestion.options.map((option, index) => (
            <button key={option.value} className="answer-card" type="button" onClick={() => choose(currentQuestion.axis, option.value)}>
              <b>{index === 0 ? "A" : "B"}</b>
              <span>
                <strong>{option.title}</strong>
                <small>{option.subtitle}</small>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function LogCard({ sip }: { sip: CheckIn }) {
  return (
    <article className="log-card">
      <DrinkIcon name={sip.drinkName} type={sip.drinkCategory} />
      <div>
        <strong>{sip.drinkName}</strong>
        <span>{sip.barName ?? sip.city ?? "Unknown place"}</span>
        <small>{sip.drinkCategory.toUpperCase()} · {formatShortDate(sip.createdAt)}</small>
      </div>
      <b>{sip.rating?.toFixed(1) ?? "-"}</b>
    </article>
  );
}

function getDrinkEmoji(category: string) {
  if (category === "beer") {
    return "🍺";
  }
  if (category === "wine") {
    return "🍷";
  }
  if (category === "whisky") {
    return "🥃";
  }
  if (category === "sake") {
    return "🍶";
  }

  return "🍸";
}

function DrinkIcon({ name, type }: { name: string; type: string }) {
  const normalizedName = name.toLowerCase().trim();
  const normalizedType = type.toLowerCase().trim();

  if (normalizedName.includes("negroni")) {
    return (
      <div className="drink-icon drink-icon-negroni">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path d="M 25,20 L 75,20 L 70,85 C 70,88 67,90 64,90 L 36,90 C 33,90 30,88 30,85 Z" fill="none" stroke="#F5F1E9" strokeWidth="4" opacity="0.4" />
          <path d="M 28,45 L 72,45 L 69,82 C 69,84 67,86 64,86 L 36,86 C 33,86 31,84 31,82 Z" fill="#991B1B" />
          <path d="M 28,45 Q 50,49 72,45" fill="none" stroke="#EF4444" strokeWidth="2" />
          <rect x="36" y="50" width="28" height="28" rx="4" fill="#E2E8F0" opacity="0.7" transform="rotate(12 50 64)" />
          <path d="M 20,38 Q 35,32 45,46" fill="none" stroke="#F97316" strokeWidth="5" strokeLinecap="round" />
          <circle cx="50" cy="58" r="3" fill="#FFF" opacity="0.6" />
        </svg>
      </div>
    );
  }

  if (normalizedName.includes("old fashioned")) {
    return (
      <div className="drink-icon drink-icon-old-fashioned">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path d="M 25,25 L 75,25 L 71,85 C 71,88 68,90 65,90 L 35,90 C 32,90 29,88 29,85 Z" fill="none" stroke="#F5F1E9" strokeWidth="4" opacity="0.4" />
          <path d="M 28,52 L 72,52 L 69,84 C 69,86 67,87 65,87 L 35,87 C 33,87 31,86 31,84 Z" fill="#B45309" />
          <path d="M 28,52 Q 50,55 72,52" fill="none" stroke="#D97706" strokeWidth="2" />
          <rect x="36" y="55" width="28" height="25" rx="3" fill="#FFF" opacity="0.5" transform="rotate(-5 50 67)" />
          <path d="M 70,30 C 65,42 75,50 68,62" fill="none" stroke="#F97316" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="45" cy="74" r="6" fill="#991B1B" />
        </svg>
      </div>
    );
  }

  if (normalizedName.includes("martini") || normalizedName.includes("gimlet") || normalizedName.includes("manhattan")) {
    const isManhattan = normalizedName.includes("manhattan");
    const isGimlet = normalizedName.includes("gimlet");
    return (
      <div className={`drink-icon ${isManhattan ? "drink-icon-manhattan" : isGimlet ? "drink-icon-gimlet" : "drink-icon-martini"}`}>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <line x1="50" y1="50" x2="50" y2="85" stroke="#F5F1E9" strokeWidth="4" opacity="0.5" />
          <path d="M 32,85 L 68,85" stroke="#F5F1E9" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
          <path d="M 24,25 L 76,25 L 50,50 Z" fill={isManhattan ? "#7F1D1D" : isGimlet ? "#E2F0D9" : "#F1F5F9"} opacity="0.95" />
          <path d="M 20,20 L 80,20 L 50,50 Z" fill="none" stroke="#F5F1E9" strokeWidth="4" opacity="0.4" />
          <line x1="33" y1="15" x2="63" y2="45" stroke="#D1D5DB" strokeWidth="1.5" />
          <circle cx="48" cy="30" r="5" fill={isManhattan ? "#B91C1C" : "#65A30D"} />
          <ellipse cx="46" cy="28" rx="1.5" ry="1" fill="#FFF" opacity="0.8" />
        </svg>
      </div>
    );
  }

  if (normalizedName.includes("mojito") || normalizedName.includes("tonic") || normalizedName.includes("mule") || normalizedName.includes("highball")) {
    const isMule = normalizedName.includes("mule");
    return (
      <div className={`drink-icon ${isMule ? "drink-icon-mule" : "drink-icon-highball"}`}>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          {isMule ? (
            <>
              <path d="M 70,35 C 85,35 85,65 70,65" fill="none" stroke="#F97316" strokeWidth="6" strokeLinecap="round" />
              <path d="M 30,25 L 70,25 L 67,85 C 67,88 64,90 60,90 L 40,90 C 36,90 33,88 33,85 Z" fill="#C2410C" />
              <circle cx="45" cy="22" r="10" fill="#84CC16" />
              <path d="M 45,22 L 55,10" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M 32,20 L 68,20 L 64,88 C 64,89 63,90 62,90 L 38,90 C 37,90 36,89 36,88 Z" fill="none" stroke="#F5F1E9" strokeWidth="4" opacity="0.4" />
              <path d="M 34,35 L 66,35 L 63,86 C 63,87 62,88 61,88 L 39,88 C 38,88 37,87 37,86 Z" fill="#F1F5F9" opacity="0.3" />
              <circle cx="42" cy="75" r="2" fill="#FFF" opacity="0.7" />
              <circle cx="58" cy="65" r="1.5" fill="#FFF" opacity="0.8" />
              <circle cx="46" cy="50" r="2.5" fill="#FFF" opacity="0.5" />
              <ellipse cx="48" cy="62" rx="10" ry="5" fill="#84CC16" transform="rotate(-20 48 62)" />
              <line x1="58" y1="12" x2="44" y2="85" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
            </>
          )}
        </svg>
      </div>
    );
  }

  if (normalizedType === "wine") {
    return (
      <div className="drink-icon drink-icon-wine">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <line x1="50" y1="55" x2="50" y2="85" stroke="#F5F1E9" strokeWidth="3" opacity="0.5" />
          <path d="M 36,85 L 64,85" stroke="#F5F1E9" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
          <path d="M 30,22 C 30,55 70,55 70,22 Z" fill="none" stroke="#F5F1E9" strokeWidth="3.5" opacity="0.4" />
          <path d="M 31,35 C 33,52 67,52 69,35 Z" fill="#881337" />
        </svg>
      </div>
    );
  }

  if (normalizedType === "beer") {
    return (
      <div className="drink-icon drink-icon-beer">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path d="M 62,35 C 75,35 75,65 62,65" fill="none" stroke="#F5F1E9" strokeWidth="4.5" opacity="0.4" />
          <path d="M 30,25 L 64,25 L 60,85 C 60,88 58,90 55,90 L 39,90 C 36,90 34,88 34,85 Z" fill="none" stroke="#F5F1E9" strokeWidth="4" opacity="0.4" />
          <path d="M 32,32 L 62,32 L 59,84 C 59,86 57,87 54,87 L 40,87 C 37,87 36,86 36,84 Z" fill="#D97706" />
          <path d="M 30,28 C 30,22 36,18 42,22 C 45,18 51,18 54,22 C 57,18 64,22 64,28 C 64,34 30,34 30,28 Z" fill="#F8FAFC" />
          <circle cx="42" cy="55" r="2" fill="#FBBF24" />
          <circle cx="50" cy="70" r="1.5" fill="#FBBF24" />
        </svg>
      </div>
    );
  }

  return (
    <div className="drink-icon drink-icon-generic">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <path d="M 32,25 L 68,25 L 60,82 C 60,85 57,88 54,88 L 46,88 C 43,88 40,85 40,82 Z" fill="none" stroke="#F5F1E9" strokeWidth="4" opacity="0.5" />
        <circle cx="50" cy="55" r="12" fill="#D97706" opacity="0.8" />
        <path d="M 42,55 L 58,55" stroke="#FFF" strokeWidth="2.5" opacity="0.7" />
        <path d="M 38,15 L 62,15 L 60,25 L 40,25 Z" fill="#E2E8F0" opacity="0.7" />
        <rect x="46" y="8" width="8" height="7" rx="1" fill="#94A3B8" />
      </svg>
    </div>
  );
}

function StatusCard({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "error" }) {
  return <div className={`status-card ${tone}`}><AlertCircle size={16} />{label}</div>;
}

function PermissionNotice({ message }: { message: string }) {
  return <div className="permission-notice"><AlertCircle size={16} />{message}</div>;
}

async function requestLocation(setCoords: (coords: Coordinates | null) => void, setLocating: (value: boolean) => void, setError: (message: string | null) => void) {
  setLocating(true);
  setError(null);

  if (!window.isSecureContext) {
    setError("Browser location prompts require HTTPS on phones. The map is using the default Shanghai location until you open the app through HTTPS.");
    setLocating(false);
    return;
  }

  if (!navigator.geolocation) {
    setError("This browser does not expose location services.");
    setLocating(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
      setLocating(false);
    },
    (error) => {
      setCoords(null);
      setError(error.code === error.PERMISSION_DENIED
        ? "Location permission was not granted. Allow location in the browser to load nearby bars."
        : "Unable to read your current location. Check location services, then retry.");
      setLocating(false);
    },
    { enableHighAccuracy: false, maximumAge: 60_000, timeout: 12_000 }
  );
}

function stopCamera(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function useCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatShortDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function clampRating(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(1, Math.min(5, parsed)) : undefined;
}
