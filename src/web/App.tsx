import {
  AlertCircle,
  ArrowLeft,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Compass,
  Heart,
  Image,
  LocateFixed,
  LogOut,
  MapPin,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Star,
  TestTube2,
  User,
  Wine,
  X
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/features/auth/auth.api";
import { useAuthStore } from "@/features/auth/auth.store";
import { getLocalSessionUser, saveLocalSessionUser, clearLocalSessionUser } from "@/features/auth/local-session";
import { barsApi } from "@/features/bars/bars.api";
import { useNearbyBarsQuery } from "@/features/bars/bars.queries";
import { chatApi } from "@/features/chat/chat.api";
import { useConversationMessagesQuery, useConversationsQuery } from "@/features/chat/chat.queries";
import { useDiaryCalendarQuery, useDiarySummaryQuery, useRecentSipsQuery } from "@/features/diary/diary.queries";
import { getDrinkIconVariant, type DrinkIconVariant } from "@/features/drinks/drink-icon-variant";
import { useGalleryFeedQuery } from "@/features/gallery/gallery.queries";
import { galleryApi } from "@/features/gallery/gallery.api";
import { useMatchCandidatesQuery } from "@/features/match/match.queries";
import { matchApi } from "@/features/match/match.api";
import type { MatchCandidate } from "@/features/match/match.types";
import { createDrunkTiResult, drunkTiQuestions, type DrunkTiResult } from "@/features/persona/drunkti";
import { useDrunkTiStore } from "@/features/persona/drunkti.store";
import { alternateDrinkCategoryOptions, clampCheckInRating, getRandomClassicCocktailName, weatherMoodOptions } from "@/features/sip/checkin-options";
import { getNearestBarAutofill } from "@/features/sip/nearest-bar";
import { sipApi } from "@/features/sip/sip.api";
import { uploadApi } from "@/features/upload/upload.api";
import { createImageFormData, compressImageForUpload } from "@/features/upload/upload.helpers";
import { getDefaultAvatarDataUri } from "@/services/media/default-avatars";
import { resolveMediaUrl } from "@/services/media/resolve-media-url";
import { diaryFilterOptions, filterDiaryLogs, getDiaryAnchorDate, getSelectedDiaryDay, type DiaryFilterKey } from "@/web/diary-utils";
import { clearTokens, setAccessToken, setRefreshToken } from "@/services/storage/token-storage";
import { createMapRegionForCoordinates, createNearbyBarsParams, defaultDiscoveryCoordinates } from "@/services/location/map-region";
import { calculateDistanceMeters } from "@/services/location/geo-utils";
import type { Bar, CheckIn, Conversation, DrinkCategory, SipDraft, User as UserType } from "@/types/domain";
import { formatDistance, formatRating } from "@/utils/format";

type MainTabKey = "discover" | "check-in" | "clink" | "me";
type DiscoverMode = "gallery" | "bars";
type MeMode = "profile" | "diary";
type DiaryStatFilter = "all" | "bar" | "rating" | null;
type Coordinates = { lat: number; lng: number };
type GenderPreference = "female" | "male" | "secret";
type MbtiAxis = "energy" | "mind" | "nature" | "tactics";
type PendingClinkConversation = Pick<Conversation, "id" | "peerAvatarUrl" | "peerDisplayName" | "peerUserId" | "title">;

const googleAuthModeKey = "barlog.auth.googleMode";

const spiritPreferenceOptions = [
  { id: "gin", title: "Gin", emoji: "🍸", description: "Crisp, botanical, refreshing" },
  { id: "vodka", title: "Vodka", emoji: "🥛", description: "Clean, neutral, highly versatile" },
  { id: "whiskey", title: "Whiskey", emoji: "🥃", description: "Rich, smoky, oak aged" },
  { id: "rum", title: "Rum", emoji: "🍹", description: "Sweet, tropical, warm cane" },
  { id: "tequila", title: "Tequila", emoji: "🌵", description: "Vibrant, agave-earthy, wild" },
  { id: "brandy", title: "Brandy", emoji: "🍇", description: "Velvet, fruit-distilled, majestic" }
] as const;

const drinkingCategoryOptions = [
  { id: "cocktails", title: "Cocktails", emoji: "🍹", description: "Artisanal mixology and balanced complexity" },
  { id: "wine", title: "Wine", emoji: "🍷", description: "Vines, terroir, and refined elegance" },
  { id: "whiskey", title: "Whiskey Neat", emoji: "🥃", description: "Pure single malts and barrel exploration" },
  { id: "craft-beer", title: "Craft Beer", emoji: "🍺", description: "Hoppy IPAs, stouts, and local brewer culture" },
  { id: "beer", title: "Beer", emoji: "🍻", description: "Crisp lagers and easy-drinking socials" }
] as const;

const mbtiAxisOptions = {
  energy: { label: "Energy", left: ["E", "Extra"], right: ["I", "Intro"] },
  mind: { label: "Mind", left: ["S", "Sensing"], right: ["N", "Intuitor"] },
  nature: { label: "Nature", left: ["T", "Think"], right: ["F", "Feel"] },
  tactics: { label: "Tactics", left: ["J", "Judge"], right: ["P", "Perceive"] }
} as const;

type BarAdSlide = {
  id: string;
  title: string;
  kicker: string;
  copy: string;
  cta: string;
  imageUrl?: string;
  isBoozerMap?: boolean;
  query?: string;
};

const barAdSlides: BarAdSlide[] = [
  {
    id: "boozer-map",
    title: "酒鬼地图",
    kicker: "CITY CRAWL ROUTES",
    copy: "Pick a route, light up every checkpoint, and make tonight feel like a tiny expedition.",
    cta: "Open route",
    isBoozerMap: true
  },
  {
    id: "cocktail-hour",
    title: "Golden Hour Guest Shift",
    kicker: "FRI 9PM · COCKTAIL BAR",
    copy: "Guest bartenders, citrus highballs, and two rounds made for the first table.",
    cta: "Save event",
    query: "cocktail bar guest shift nearby",
    imageUrl: "https://images.pexels.com/photos/2209519/pexels-photo-2209519.jpeg?auto=compress&cs=tinysrgb&w=900"
  },
  {
    id: "vinyl-night",
    title: "Vinyl & Negroni Night",
    kicker: "SAT 10PM · LISTENING BAR",
    copy: "Classic aperitivo drinks with a late-night vinyl set and a low-lit booth list.",
    cta: "View lineup",
    query: "listening bar negroni vinyl nearby",
    imageUrl: "https://images.pexels.com/photos/1850595/pexels-photo-1850595.jpeg?auto=compress&cs=tinysrgb&w=900"
  }
];

const boozerMapPoints = [
  { id: "aperitif", label: "Aperitif", left: 18, top: 72 },
  { id: "highball", label: "Highball", left: 38, top: 48 },
  { id: "jazz", label: "Jazz", left: 58, top: 62 },
  { id: "nightcap", label: "Nightcap", left: 78, top: 30 }
] as const;

export function App() {
  const [tab, setTab] = useState<MainTabKey>("discover");
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
      setTab("discover");
    }} />;
  }

  return (
    <div className="app-shell">
      <main className="phone-frame">
        {tab === "discover" ? <DiscoverScreen /> : null}
        {tab === "check-in" ? <SipScreen onPublished={() => setTab("me")} /> : null}
        {tab === "clink" ? <ClinkScreen /> : null}
        {tab === "me" ? <MeScreen user={user} onLogout={async () => {
          await clearTokens();
          await clearLocalSessionUser();
          setUser(null);
        }} /> : null}
      </main>
      <nav className="tabbar" aria-label="Main navigation">
        <TabButton active={tab === "discover"} icon={<Compass />} label="Discover" onClick={() => setTab("discover")} />
        <button className="sip-tab" type="button" aria-label="Open check-in" onClick={() => setTab("check-in")}>
          <Camera />
          <span>CheckIn</span>
        </button>
        <TabButton active={tab === "clink"} icon={<ClinkIcon />} label="Clink" onClick={() => setTab("clink")} />
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [pendingOnboardingUser, setPendingOnboardingUser] = useState<UserType | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const accessToken = query.get("accessToken");
    const refreshToken = query.get("refreshToken") ?? undefined;
    const error = query.get("error");

    if (error) {
      setMessage(error);
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    if (!accessToken) {
      return;
    }

    setGoogleLoading(true);
    setMessage("Finishing Google sign-in...");
    void completeAuthResponse(authApi.completeGoogleAuth({ accessToken, refreshToken }))
      .then((nextUser) => {
        const googleMode = window.sessionStorage.getItem(googleAuthModeKey);
        window.sessionStorage.removeItem(googleAuthModeKey);
        if (googleMode === "register") {
          setPendingOnboardingUser(nextUser);
          return;
        }
        onAuthed(nextUser);
      })
      .catch((authError) => {
        setMessage(authError instanceof Error ? authError.message : "Unable to finish Google sign-in.");
      })
      .finally(() => {
        setGoogleLoading(false);
        window.history.replaceState({}, "", window.location.pathname);
      });
  }, [onAuthed]);

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
      const nextUser = await persistAuthResponse(response, nextEmail);
      if (mode === "register") {
        setPendingOnboardingUser(nextUser);
        return;
      }
      onAuthed(nextUser);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to authenticate.");
    } finally {
      setLoading(false);
    }
  }

  async function continueWithGoogle() {
    setGoogleLoading(true);
    setMessage("Opening Google sign-in...");

    try {
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const { authUrl } = await authApi.startGoogleAuth({ redirectUri, mode });
      window.sessionStorage.setItem(googleAuthModeKey, mode);
      window.location.assign(authUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to open Google sign-in.");
      setGoogleLoading(false);
    }
  }

  if (pendingOnboardingUser) {
    return (
      <OnboardingSurvey
        user={pendingOnboardingUser}
        onComplete={(survey) => {
          window.localStorage.setItem("barlog.onboarding.preferences", JSON.stringify(survey));
          onAuthed(pendingOnboardingUser);
        }}
      />
    );
  }

  return (
    <div className="auth-screen">
      <div className="brand-block">
        <p className="eyebrow">ALCOHOL% PORTAL</p>
        <h1>BarLog</h1>
        <span />
      </div>
      <section className="auth-card">
        <div className="switcher">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">Login</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")} type="button">Register</button>
        </div>
        <label className={`field auth-register-field ${mode === "register" ? "is-visible" : ""}`} aria-hidden={mode !== "register"}>
          <span>Tonight Name</span>
          <input disabled={mode !== "register"} value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Crimson Guest" />
        </label>
        <label className="field">
          <span>Email Address</span>
          <input autoCapitalize="none" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="demo@barlog.app" />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="password123" />
        </label>
        <p className={`auth-message-slot ${message ? "is-visible" : ""}`}>{message ?? " "}</p>
        <button className="primary-button" disabled={loading} onClick={submit} type="button">
          {loading ? "POURING INSPIRATION..." : mode === "login" ? "ENTER BARLOG" : "CREATE NIGHT ID"}
        </button>
        <button className="google-login-button" disabled={loading || googleLoading} onClick={continueWithGoogle} type="button">
          <span aria-hidden="true">G</span>
          {googleLoading ? "Opening Google..." : "Enter with Google"}
        </button>
      </section>
    </div>
  );
}

function OnboardingSurvey({
  onComplete,
  user
}: {
  onComplete: (survey: {
    category: string;
    gender: GenderPreference;
    mbti: string;
    spirits: string[];
    userId: string;
  }) => void;
  user: UserType;
}) {
  const [step, setStep] = useState(0);
  const [spirits, setSpirits] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState<GenderPreference>("secret");
  const [mbti, setMbti] = useState<Record<MbtiAxis, "left" | "right">>({
    energy: "right",
    mind: "right",
    nature: "right",
    tactics: "right"
  });
  const displayName = user.displayName || "XX";
  const canContinue = step === 0 ? spirits.length > 0 : step === 1 ? Boolean(category) : true;
  const mbtiCode = (Object.entries(mbti) as Array<[MbtiAxis, "left" | "right"]>)
    .map(([axis, side]) => mbtiAxisOptions[axis][side][0])
    .join("");

  const toggleSpirit = (id: string) => {
    setSpirits((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };
  const next = () => {
    if (step < 2) {
      setStep((current) => current + 1);
      return;
    }

    onComplete({
      category,
      gender,
      mbti: mbtiCode,
      spirits,
      userId: user.id
    });
  };

  return (
    <main className="onboarding-screen">
      <header className="onboarding-top">
        <span>WELCOME, {displayName.toUpperCase()}</span>
        <strong>STEP {step + 1} OF 3</strong>
        <div>
          {[0, 1, 2].map((item) => <i className={item <= step ? "active" : ""} key={item} />)}
        </div>
      </header>

      <section className="onboarding-content">
        {step === 0 ? (
          <>
            <OnboardingIntro kicker="FLAVOR PREFERENCE · SPIRITS" title="Which base spirits do you prefer?" body="Select multiple to help us discover your unique soul-flavor recipe tonight." />
            <div className="onboarding-spirit-grid">
              {spiritPreferenceOptions.map((option) => (
                <button className={spirits.includes(option.id) ? "active" : ""} key={option.id} onClick={() => toggleSpirit(option.id)} type="button">
                  <strong>{option.title} <span>{option.emoji}</span></strong>
                  <small>{option.description}</small>
                </button>
              ))}
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <OnboardingIntro kicker="DAILY SELECTION · CATEGORY" title="What are you looking for tonight?" body="Your personalized drinking guidelines. Select one key category." />
            <div className="onboarding-category-list">
              {drinkingCategoryOptions.map((option) => (
                <button className={category === option.id ? "active" : ""} key={option.id} onClick={() => setCategory(option.id)} type="button">
                  <i>✧</i>
                  <span>
                    <strong>{option.title} {option.emoji}</strong>
                    <small>{option.description}</small>
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className="onboarding-choice-section">
              <span className="onboarding-dot-label">GENDER IDENTIFICATION</span>
              <div className="onboarding-gender-row">
                {(["female", "male", "secret"] as GenderPreference[]).map((item) => (
                  <button className={gender === item ? "active" : ""} key={item} onClick={() => setGender(item)} type="button">
                    {item === "female" ? "👩 Female" : item === "male" ? "👨 Male" : "✦ Secret"}
                  </button>
                ))}
              </div>
            </div>

            <div className="onboarding-choice-section">
              <span className="onboarding-dot-label">DRUNKTI CHEMICAL (MBTI) <b>{mbtiCode}</b></span>
              <div className="onboarding-mbti-card">
                {(Object.entries(mbtiAxisOptions) as Array<[MbtiAxis, typeof mbtiAxisOptions[MbtiAxis]]>).map(([axis, axisOption]) => (
                  <div className="onboarding-mbti-row" key={axis}>
                    <span>{axisOption.label}</span>
                    <div>
                      {(["left", "right"] as const).map((side) => (
                        <button className={mbti[axis] === side ? "active" : ""} key={side} onClick={() => setMbti((current) => ({ ...current, [axis]: side }))} type="button">
                          {axisOption[side][0]} ({axisOption[side][1]})
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </section>

      <footer className="onboarding-actions">
        {step > 0 ? <button className="onboarding-back" onClick={() => setStep((current) => current - 1)} type="button">BACK</button> : null}
        <button className="onboarding-next" disabled={!canContinue} onClick={next} type="button">
          {step === 2 ? "BEGIN BAR JOURNEY ✨" : "NEXT STEP ›"}
        </button>
      </footer>
    </main>
  );
}

function OnboardingIntro({ body, kicker, title }: { body: string; kicker: string; title: string }) {
  return (
    <div className="onboarding-intro">
      <span>{kicker}</span>
      <h1>{title}</h1>
      <p>{body}</p>
    </div>
  );
}

async function completeAuthResponse(responsePromise: Promise<Awaited<ReturnType<typeof authApi.completeGoogleAuth>>>) {
  const response = await responsePromise;
  return persistAuthResponse(response);
}

async function persistAuthResponse(response: Awaited<ReturnType<typeof authApi.login>>, fallbackEmail = "") {
  const nextUser = { ...response.user, email: response.user.email ?? fallbackEmail };
  await setAccessToken(response.accessToken);
  if (response.refreshToken) {
    await setRefreshToken(response.refreshToken);
  }
  await saveLocalSessionUser(nextUser);
  return nextUser;
}

function DiaryScreen({ beforeContent }: { beforeContent?: ReactNode } = {}) {
  const month = useCurrentMonth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSipCard, setSelectedSipCard] = useState<CheckIn | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<DiaryFilterKey>("all");
  const [activeStatFilter, setActiveStatFilter] = useState<DiaryStatFilter>("all");
  const [isDrunkTiOpen, setIsDrunkTiOpen] = useState(false);
  const drunkTiResult = useDrunkTiStore((state) => state.result);
  const setDrunkTiResult = useDrunkTiStore((state) => state.setResult);
  const summary = useDiarySummaryQuery(month);
  const calendar = useDiaryCalendarQuery(month);
  const recent = useRecentSipsQuery();
  const logs = recent.data?.items ?? [];
  const baseVisibleLogs = filterDiaryLogs(logs, { category: activeFilter, search, selectedDate });
  const visibleLogs = baseVisibleLogs.filter((sip) => {
    if (activeStatFilter === "bar") {
      return Boolean(sip.barName ?? sip.area ?? sip.city);
    }
    if (activeStatFilter === "rating") {
      return typeof sip.rating === "number";
    }
    return true;
  });
  const totalCheckIns = summary.isLoading ? "..." : String(summary.data?.checkInCount ?? 0);
  const uniqueBars = summary.isLoading ? "..." : String(summary.data?.barsVisited ?? 0);
  const avgRating = summary.isLoading ? "..." : summary.data?.averageRating?.toFixed(1) ?? "-";

  return (
    <Screen title="Diary" subtitle="Your personal drinking archive.">
      {beforeContent}
      <div className="diary-actions">
        <button className="drunkti-button" type="button" onClick={() => setIsDrunkTiOpen(true)}>
          <TestTube2 size={14} />
          DrunkTI
          {drunkTiResult ? <span>{drunkTiResult.code}</span> : null}
        </button>
      </div>
      <div className="stats-grid">
        <Stat
          active={activeStatFilter === "all"}
          icon={<Wine size={16} />}
          label="TOTAL LOGS"
          onClick={() => setActiveStatFilter((current) => current === "all" ? null : "all")}
          statusLabel="ALL"
          unit="LOGS"
          value={totalCheckIns}
        />
        <Stat
          active={activeStatFilter === "bar"}
          icon={<MapPin size={16} />}
          label="EXPLORED"
          onClick={() => setActiveStatFilter((current) => current === "bar" ? null : "bar")}
          statusLabel="BAR"
          unit="BARS"
          value={uniqueBars}
        />
        <Stat
          active={activeStatFilter === "rating"}
          icon={<Star size={16} />}
          label="AVG RATING"
          onClick={() => setActiveStatFilter((current) => current === "rating" ? null : "rating")}
          statusLabel="RATING"
          unit="PTS"
          value={avgRating}
        />
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
        {visibleLogs.map((sip) => <LogCard key={sip.id} sip={sip} onOpenCard={setSelectedSipCard} />)}
        {!recent.isLoading && !visibleLogs.length ? <StatusCard label="No matching logs returned." /> : null}
      </div>
      {selectedSipCard ? <CheckInCardModal sip={selectedSipCard} onClose={() => setSelectedSipCard(null)} /> : null}
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
  const [mode, setMode] = useState<DiscoverMode>("gallery");
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeAdIndex, setActiveAdIndex] = useState(0);
  const [boozerMapOpen, setBoozerMapOpen] = useState(false);
  const [barQuestionDraft, setBarQuestionDraft] = useState("");
  const [barQuestion, setBarQuestion] = useState("");
  const [isDrunkTiOpen, setIsDrunkTiOpen] = useState(false);
  const drunkTiResult = useDrunkTiStore((state) => state.result);
  const setDrunkTiResult = useDrunkTiStore((state) => state.setResult);
  const referenceCoords = coords ?? defaultDiscoveryCoordinates;
  const params = useMemo(() => {
    const baseParams = createNearbyBarsParams(coords);
    const query = barQuestion.trim();
    return baseParams && query ? { ...baseParams, query } : baseParams;
  }, [barQuestion, coords]);
  const nearby = useNearbyBarsQuery(params, { enabled: mode === "bars" && Boolean(params) });
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
  }, [mode]);

  return (
    <section className="screen">
      <div className="discover-header-row">
        <PageHeader title="Discover" subtitle="Gallery check-ins and nearby bars powered by backend data." />
        <button className="drunkti-button discover-header-action" type="button" onClick={() => setIsDrunkTiOpen(true)}>
          <TestTube2 size={14} />
          DrunkTI
          {drunkTiResult ? <span>{drunkTiResult.code}</span> : null}
        </button>
      </div>
      <div className="segmented">
        <button className={mode === "gallery" ? "active" : ""} onClick={() => setMode("gallery")} type="button">Gallery</button>
        <button className={mode === "bars" ? "active" : ""} onClick={() => setMode("bars")} type="button">Bars</button>
      </div>
      {mode === "gallery" ? (
        <CommunityFeed />
      ) : (
        <>
          <SectionLabel icon={<Compass size={17} />} label="BAR HAPPENINGS" />
          <BarAdCarousel
            activeIndex={activeAdIndex}
            onChange={setActiveAdIndex}
            onApplyBarPrompt={(query) => {
              setBarQuestionDraft(query);
              setBarQuestion(query);
            }}
            onOpenBoozerMap={() => setBoozerMapOpen(true)}
            slides={barAdSlides}
          />
          {/* MapPreview temporarily replaced by BarAdCarousel.
          <MapPreview bars={bars} region={region} userCoordinate={referenceCoords} /> */}
          <form
            className="bar-question-search"
            onSubmit={(event) => {
              event.preventDefault();
              setBarQuestion(barQuestionDraft.trim());
            }}
          >
            <div>
              <Sparkles size={15} />
              <input
                value={barQuestionDraft}
                onChange={(event) => setBarQuestionDraft(event.target.value)}
                placeholder="Ask for a bar: quiet jazz, date night, craft beer nearby..."
              />
              {barQuestionDraft ? (
                <button
                  aria-label="Clear bar search"
                  type="button"
                  onClick={() => {
                    setBarQuestionDraft("");
                    setBarQuestion("");
                  }}
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>
            <button type="submit">Search</button>
          </form>
          {barQuestion ? <StatusCard label={`Searching bars for: ${barQuestion}`} /> : null}
          {!coords ? <StatusCard label="Waiting for browser location permission before loading nearby bars." /> : null}
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
          <BoozerMapModal visible={boozerMapOpen} onClose={() => setBoozerMapOpen(false)} />
        </>
      )}
      <DrunkTiModal
        onClose={() => setIsDrunkTiOpen(false)}
        onSave={(result) => {
          setDrunkTiResult(result);
          setIsDrunkTiOpen(false);
        }}
        visible={isDrunkTiOpen}
      />
    </section>
  );
}

function ClinkScreen() {
  const [mode, setMode] = useState<"match" | "chats">("match");
  const [pendingConversation, setPendingConversation] = useState<PendingClinkConversation | null>(null);
  const pendingConversationId = pendingConversation?.id ?? null;
  const conversations = useConversationsQuery();
  const chatCount = Math.min(conversations.data?.items.length ?? 0, 3);
  const beforeContent = (
    <div className="clink-tabs">
      <button className={mode === "match" ? "active" : ""} onClick={() => setMode("match")} type="button">
        <ClinkIcon />
        Nearby Radar
      </button>
      <button className={mode === "chats" ? "active" : ""} onClick={() => setMode("chats")} type="button">
        Clinks ({chatCount})
      </button>
    </div>
  );

  return (
    <section className="screen clink-screen">
      <PageHeader title="Clink" subtitle="Match and chat with tonight's drinking buddies." />
      {beforeContent}
      {mode === "match" ? (
        <MatchPanel
          conversations={conversations}
          onOpenClinks={(conversation) => {
            setPendingConversation(conversation);
            setMode("chats");
          }}
        />
      ) : (
        <ChatPanel
          conversations={conversations}
          initialConversationFallback={pendingConversation}
          initialConversationId={pendingConversationId}
          onInitialConversationOpened={() => setPendingConversation(null)}
        />
      )}
    </section>
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
  const [barName, setBarName] = useState("");
  const [city, setCity] = useState<string | undefined>();
  const [category, setCategory] = useState<DrinkCategory | null>("cocktail");
  const [rating, setRating] = useState(4.5);
  const [mood, setMood] = useState("sunny");
  const [note, setNote] = useState("Bittersweet, citrus-lit, and ready for a slow second sip.");
  const publish = useMutation({
    mutationFn: async () => {
      if (!photo) {
        throw new Error("Take or upload a photo before publishing.");
      }
      const compressed = await compressImageForUpload(photo.blob);
      const formData = createImageFormData(compressed, "sip.jpg", "image/jpeg");
      const photoUpload = await uploadApi.uploadImage(formData);
      const selectedCategory = category ?? "cocktail";
      const cardBlob = await createGeneratedCardBlob({
        barName: barName.trim() || "Tonight",
        drinkName: drinkName.trim() || "Tonight's Sip",
        note: note.trim() || "Bittersweet, citrus-lit, and ready for a slow second sip.",
        photoUrl: photo.url
      });
      const cardFormData = createImageFormData(cardBlob, "sip-card.jpg", "image/jpeg");
      const cardUpload = await uploadApi.uploadCardImage(cardFormData);
      const draft: SipDraft = {
        localPhotoUri: photo.url,
        uploadedPhotoUrl: photoUpload.imageUrl,
        generatedCardUri: photo.url,
        uploadedCardUrl: cardUpload.imageUrl,
        drinkName: drinkName.trim() || "Tonight's Sip",
        drinkCategory: selectedCategory,
        barName: barName.trim() || undefined,
        city,
        moodTags: mood ? [mood] : [],
        rating,
        vibeMumbling: note.trim() || undefined,
        cardStyle: "receipt",
        visibility: "tonight_only",
        socialStatus: "not_social"
      };
      const createdCheckIn = await sipApi.createCheckIn({
        photoUrl: draft.uploadedPhotoUrl!,
        cardImageUrl: draft.uploadedCardUrl,
        drinkName: draft.drinkName!,
        drinkCategory: draft.drinkCategory!,
        barName: draft.barName,
        city: draft.city,
        moodTags: draft.moodTags,
        rating: draft.rating,
        vibeMumbling: draft.vibeMumbling,
        cardStyle: draft.cardStyle,
        visibility: draft.visibility,
        socialStatus: draft.socialStatus
      });

      await galleryApi.createPost({
        imageUrl: draft.uploadedPhotoUrl!,
        cardImageUrl: draft.uploadedCardUrl,
        caption: draft.vibeMumbling,
        city: draft.city,
        barName: draft.barName,
        rating: draft.rating
      });

      return createdCheckIn;
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
      setDrinkName(getRandomClassicCocktailName());
      setCategory("cocktail");
      setPhoto({ blob, url: URL.createObjectURL(blob) });
      setFlipped(false);
      stopCamera(streamRef.current);
      setCameraReady(false);
      void fillNearestBarForWebCheckIn(setBarName, setCity);
    }, "image/jpeg", 0.92);
  }

  function chooseFile(file?: File) {
    if (!file) {
      return;
    }
    setDrinkName(getRandomClassicCocktailName());
    setCategory("cocktail");
    setPhoto({ blob: file, url: URL.createObjectURL(file) });
    setFlipped(false);
    void fillNearestBarForWebCheckIn(setBarName, setCity);
  }

  return (
    <Screen title="CheckIn" subtitle="Shoot, generate, flip, and publish.">
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
          {!flipped ? (
            <button className="generated-card" type="button" onClick={() => setFlipped(true)}>
              <img src={photo.url} alt="Captured drink" />
              <div className="card-copy">
                <p>MOCK GENERATED CARD</p>
                <h2>{drinkName}</h2>
                <span>{barName || "Finding nearest bar..."}</span>
                <small>{note}</small>
              </div>
              <div className="flip-hint"><RefreshCw size={13} /> TAP TO FLIP</div>
            </button>
          ) : (
            <div className="generated-card">
              <div className="card-form">
                <Field label="Drink"><input value={drinkName} onChange={(event) => setDrinkName(event.target.value)} /></Field>
                <div className="drink-or-row">
                  {alternateDrinkCategoryOptions.map((item) => (
                    <button
                      key={item.value}
                      className={category === item.value ? "active" : ""}
                      type="button"
                      onClick={() => setCategory((current) => current === item.value ? null : item.value as DrinkCategory)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <Field label="Bar"><input value={barName} onChange={(event) => setBarName(event.target.value)} /></Field>
                <div className="two-fields">
                  <Field label="Rating"><HeartRating value={rating} onChange={setRating} /></Field>
                  <Field label="Mood"><WeatherMoodPicker value={mood} onChange={setMood} /></Field>
                </div>
                <Field label="Saying something..."><textarea value={note} onChange={(event) => setNote(event.target.value)} /></Field>
              </div>
            </div>
          )}
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

function HeartRating({ onChange, value }: { onChange: (value: number) => void; value: number }) {
  const clipId = useId();
  const updateFromPointer = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    onChange(clampCheckInRating(ratio * 5));
  };

  return (
    <button
      className="heart-rating"
      type="button"
      onClick={updateFromPointer}
      onPointerMove={(event) => {
        if (event.buttons === 1) {
          updateFromPointer(event);
        }
      }}
      aria-label={`Rating ${value.toFixed(1)} out of 5`}
    >
      <span className="heart-rating-heart" aria-hidden="true">
        <svg viewBox="0 0 100 92">
          <defs>
            <clipPath id={clipId}>
              <path d="M50 84S8 59 8 30C8 14 19 6 31 6c8 0 15 4 19 11C54 10 61 6 69 6c12 0 23 8 23 24 0 29-42 54-42 54Z" />
            </clipPath>
          </defs>
          <path
            d="M50 84S8 59 8 30C8 14 19 6 31 6c8 0 15 4 19 11C54 10 61 6 69 6c12 0 23 8 23 24 0 29-42 54-42 54Z"
            fill="rgba(255,255,255,0.12)"
            stroke="#ffffff"
            strokeWidth="4"
          />
          <rect x="0" y="0" width={(value / 5) * 100} height="92" fill="#964b67" clipPath={`url(#${clipId})`} />
          <path
            d="M50 84S8 59 8 30C8 14 19 6 31 6c8 0 15 4 19 11C54 10 61 6 69 6c12 0 23 8 23 24 0 29-42 54-42 54Z"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
          />
        </svg>
      </span>
      <strong>{value.toFixed(1)}/5</strong>
    </button>
  );
}

async function createGeneratedCardBlob({
  barName,
  drinkName,
  note,
  photoUrl
}: {
  barName: string;
  drinkName: string;
  note: string;
  photoUrl: string;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1500;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to create check-in card.");
  }

  const image = await loadImage(photoUrl);
  const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "rgba(18, 6, 5, 0.12)");
  gradient.addColorStop(0.45, "rgba(18, 6, 5, 0.25)");
  gradient.addColorStop(1, "rgba(8, 1, 1, 0.9)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#c68334";
  context.font = "900 34px Arial";
  context.fillText("BARLOG CHECK-IN", 72, canvas.height - 330);

  context.fillStyle = "#faf6ee";
  context.font = "900 96px Arial";
  wrapCanvasText(context, drinkName, 72, canvas.height - 230, canvas.width - 144, 104, 2);

  context.font = "800 38px Arial";
  context.fillText(barName, 72, canvas.height - 118);

  context.fillStyle = "#d0c3b7";
  context.font = "700 31px Arial";
  wrapCanvasText(context, note, 72, canvas.height - 62, canvas.width - 144, 42, 2);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("Unable to export check-in card."));
    }, "image/jpeg", 0.9);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load card photo."));
    image.src = src;
  });
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = text.split(/\s+/).filter(Boolean);
  let line = "";
  let lineCount = 0;

  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word;
    if (context.measureText(nextLine).width > maxWidth && line) {
      context.fillText(line, x, y + lineCount * lineHeight);
      line = word;
      lineCount += 1;
      if (lineCount >= maxLines) {
        return;
      }
    } else {
      line = nextLine;
    }
  }

  if (line && lineCount < maxLines) {
    context.fillText(line, x, y + lineCount * lineHeight);
  }
}

function WeatherMoodPicker({ onChange, value }: { onChange: (value: string) => void; value: string }) {
  return (
    <div className="weather-mood-grid">
      {weatherMoodOptions.map((option) => (
        <button
          key={option.value}
          className={value === option.value ? "active" : ""}
          type="button"
          onClick={() => onChange(option.value)}
          aria-label={option.label}
        >
          <span>{option.icon}</span>
          <small>{option.label}</small>
        </button>
      ))}
    </div>
  );
}

async function fillNearestBarForWebCheckIn(
  setBarName: (value: string) => void,
  setCity: (value: string | undefined) => void
) {
  try {
    const coords = await getBrowserCoordinates();
    const params = createNearbyBarsParams(coords);

    if (!params) {
      return;
    }

    const nearby = await barsApi.getNearby(params);
    const autofill = getNearestBarAutofill(nearby.items, coords);

    if (autofill) {
      setBarName(autofill.barName);
      setCity(autofill.city);
    }
  } catch {
    // Location autofill is opportunistic; manual Bar entry remains available.
  }
}

function getBrowserCoordinates(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!window.isSecureContext || !navigator.geolocation) {
      reject(new Error("Browser geolocation unavailable."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      reject,
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 }
    );
  });
}

function MeScreen({ user, onLogout }: { user: UserType; onLogout: () => void }) {
  const [mode, setMode] = useState<MeMode>("profile");
  const drunkTiResult = useDrunkTiStore((state) => state.result);
  const onboarding = getStoredOnboardingPreferences();
  const avatarSrc = user.avatarUrl ? resolveMediaUrl(user.avatarUrl) : getDefaultAvatarDataUri(user.id || user.email || user.displayName);
  const mbtiCode = drunkTiResult?.code ?? onboarding?.mbti ?? "INFP";
  const preferredCategory = formatPreferenceLabel(onboarding?.category ?? "craft-beer");
  const preferredBases = onboarding?.spirits?.length ? onboarding.spirits.join(", ") : "vodka";
  const beforeContent = (
    <div className="segmented">
      <button className={mode === "profile" ? "active" : ""} onClick={() => setMode("profile")} type="button">Profile</button>
      <button className={mode === "diary" ? "active" : ""} onClick={() => setMode("diary")} type="button">Diary</button>
    </div>
  );

  if (mode === "diary") {
    return <DiaryScreen beforeContent={beforeContent} />;
  }

  return (
    <Screen title="Me" subtitle="Profile, settings, and local PWA state.">
      {beforeContent}
      <section className="profile-card">
        <img className="profile-avatar" src={avatarSrc} alt="" />
        <div className="profile-main">
          <div className="profile-name-row">
            <h2>{user.displayName}</h2>
            <span>LV.13</span>
            <em>{mbtiCode}</em>
          </div>
          <p>{user.email ?? "No email returned"}</p>
          <strong>🏆 MIDNIGHT EXPLORER</strong>
          <div className="profile-chip-row">
            <i>✦ {onboarding?.gender ? formatPreferenceLabel(onboarding.gender) : "Secret"}</i>
            <i className="active">{preferredCategory}</i>
            <i>Bases: {preferredBases}</i>
          </div>
        </div>
        <button className="profile-logout-icon" type="button" onClick={onLogout} aria-label="Log out">
          <LogOut size={19} />
        </button>
        {drunkTiResult ? <DrunkTiResultCard result={drunkTiResult} variant="profile" /> : null}
      </section>
    </Screen>
  );
}

function getStoredOnboardingPreferences():
  | { category?: string; gender?: string; mbti?: string; spirits?: string[] }
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return JSON.parse(window.localStorage.getItem("barlog.onboarding.preferences") ?? "null");
  } catch {
    return null;
  }
}

function formatPreferenceLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function CommunityFeed() {
  const feed = useGalleryFeedQuery({ city: "Shanghai", range: "24h" });
  const [selectedAuthor, setSelectedAuthor] = useState<GalleryAuthorPost | null>(null);
  const [expandedGalleryCards, setExpandedGalleryCards] = useState<Set<string>>(() => new Set());
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
  const toggleExpandedGalleryCard = (postId: string) => {
    setExpandedGalleryCards((current) => {
      const next = new Set(current);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
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
          const hasCardImage = hasCommunityPostCardImage(post);
          const imageSrc = getCommunityPostImage(post);
          const imageFailed = failedImages.has(post.id);
          const isExpanded = expandedGalleryCards.has(post.id);
          const rating = getCommunityPostRating(post);

          return (
            <article className="feed-card" key={post.id}>
              {imageSrc && !imageFailed ? (
                <button
                  className={`feed-card-media ${isExpanded ? "is-expanded" : ""}`}
                  type="button"
                  onClick={() => toggleExpandedGalleryCard(post.id)}
                  aria-label={isExpanded ? "Collapse check-in card" : "Show full check-in card"}
                >
                  <img
                    className={`feed-card-photo ${hasCardImage ? "is-card" : ""}`}
                    src={imageSrc}
                    alt={post.caption ?? post.barName ?? "Check-in photo"}
                    onError={() => {
                      setFailedImages((current) => new Set(current).add(post.id));
                    }}
                  />
                </button>
              ) : (
                <div className="feed-card-photo feed-card-photo-fallback">
                  <Image size={22} />
                  <span>Check-in Photo</span>
                </div>
              )}
              <div className="feed-card-body">
                <div className="feed-card-top">
                  <span>
                    <button className="feed-author-button" type="button" onClick={() => setSelectedAuthor(post)}>
                      {post.authorName}
                    </button>
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
                <span className="feed-card-rating"><Star size={13} /> {rating}</span>
                {post.caption ? <p>{post.caption}</p> : null}
              </div>
            </article>
          );
        })}
      </div>
      {!feed.isLoading && !(feed.data?.items ?? []).length ? <StatusCard label="No community posts returned." /> : null}
      {selectedAuthor ? (
        <div className="gallery-user-popover-scrim" role="dialog" aria-modal="true" aria-label={`${selectedAuthor.authorName} profile`}>
          <section className="gallery-user-popover">
            <button className="gallery-user-popover-close" type="button" onClick={() => setSelectedAuthor(null)} aria-label="Close profile">
              <X size={15} />
            </button>
            <img src={getDefaultAvatarDataUri(selectedAuthor.userId || selectedAuthor.authorName)} alt="" />
            <div>
              <strong>{selectedAuthor.authorName}</strong>
              <span>{selectedAuthor.city ?? "Tonight City"}</span>
            </div>
            <p>{selectedAuthor.caption?.trim() || `Shared from ${selectedAuthor.barName ?? "a late-night check-in"}.`}</p>
            <small>{selectedAuthor.barName ?? "BarLog member"} · {formatShortDate(selectedAuthor.createdAt)}</small>
          </section>
        </div>
      ) : null}
    </>
  );
}

type GalleryAuthorPost = CommunityImagePost & {
  authorName: string;
  barName?: string;
  caption?: string;
  city?: string;
  createdAt: string;
  userId: string;
};

type CommunityImagePost = {
  cardImageUrl?: string;
  checkIn?: CommunityImagePost;
  checkin?: CommunityImagePost;
  checkInPhotoUrl?: string;
  data?: CommunityImagePost;
  generatedCardUri?: string;
  imageUrl?: string;
  images?: string[];
  likedByMe?: boolean;
  likedByCurrentUser?: boolean;
  mediaUrl?: string;
  metadata?: CommunityImagePost;
  post?: CommunityImagePost;
  photo?: string;
  photoUrl?: string;
  photos?: string[];
  score?: number | string;
  checkInRating?: number | string;
  checkinRating?: number | string;
  drinkRating?: number | string;
  overallRating?: number | string;
  rating?: number | string;
  sip?: CommunityImagePost;
  sipCard?: CommunityImagePost;
  thumbnailUrl?: string;
  userPost?: CommunityImagePost;
  uploadedPhotoUrl?: string;
};

function getCommunityPostImage(post: CommunityImagePost): string {
  const raw = post.cardImageUrl ||
    post.generatedCardUri ||
    post.imageUrl ||
    post.photoUrl ||
    post.checkInPhotoUrl ||
    post.mediaUrl ||
    post.thumbnailUrl ||
    post.photo ||
    post.uploadedPhotoUrl ||
    post.images?.[0] ||
    post.photos?.[0] ||
    (post.checkIn ? getCommunityPostImage(post.checkIn) : "");

  return resolveMediaUrl(raw);
}

function hasCommunityPostCardImage(post: CommunityImagePost): boolean {
  return Boolean(post.cardImageUrl || post.generatedCardUri || (post.checkIn ? hasCommunityPostCardImage(post.checkIn) : false));
}

function getCommunityPostRating(post: CommunityImagePost): string {
  const rating = readCommunityPostRating(post);
  return typeof rating === "number" ? `${rating.toFixed(1)}/5` : "-/5";
}

function normalizeCommunityPostRatingValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const match = value.match(/\d+(?:\.\d+)?/);
    if (!match) {
      return undefined;
    }

    const parsed = Number.parseFloat(match[0]);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function readCommunityPostRating(post: CommunityImagePost, seen = new WeakSet<object>()): number | undefined {
  if (seen.has(post)) {
    return undefined;
  }

  seen.add(post);

  const direct = [
    post.rating,
    post.checkInRating,
    post.checkinRating,
    post.drinkRating,
    post.overallRating,
    post.score
  ]
    .map((value) => normalizeCommunityPostRatingValue(value))
    .find((value) => typeof value === "number");

  if (typeof direct === "number") {
    return direct;
  }

  for (const [key, value] of Object.entries(post as Record<string, unknown>)) {
    if (!/(rating|score)/i.test(key)) {
      continue;
    }

    const normalized = normalizeCommunityPostRatingValue(value);
    if (typeof normalized === "number") {
      return normalized;
    }
  }

  for (const value of Object.values(post as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === "object") {
          const nestedRating = readCommunityPostRating(item as CommunityImagePost, seen);
          if (typeof nestedRating === "number") {
            return nestedRating;
          }
        }
      }
      continue;
    }

    if (value && typeof value === "object") {
      const nestedRating = readCommunityPostRating(value as CommunityImagePost, seen);
      if (typeof nestedRating === "number") {
        return nestedRating;
      }
    }
  }

  return undefined;
}

function getClinkChatShellHeight(): number {
  if (typeof window === "undefined") {
    return 500;
  }

  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  return Math.min(500, Math.max(300, viewportHeight - 360));
}

function MatchPanel({
  conversations,
  onOpenClinks
}: {
  conversations: ReturnType<typeof useConversationsQuery>;
  onOpenClinks: (conversation: PendingClinkConversation) => void;
}) {
  const candidates = useMatchCandidatesQuery();
  const [helloCard, setHelloCard] = useState<{ candidate: MatchCandidate; conversationId: string } | null>(null);
  const [savedChatIds, setSavedChatIds] = useState<string[]>(() => {
    try {
      return JSON.parse(window.localStorage.getItem("barlog.match.savedChats") ?? "[]");
    } catch {
      return [];
    }
  });
  const connect = useMutation({
    mutationFn: (userId: string) => matchApi.connect(userId),
    onSuccess: () => {
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
  useEffect(() => {
    window.localStorage.setItem("barlog.match.savedChats", JSON.stringify(savedChatIds));
  }, [savedChatIds]);

  const openChat = async (candidate: MatchCandidate) => {
    setSavedChatIds((current) => [candidate.id, ...current.filter((id) => id !== candidate.id)].slice(0, 3));
    try {
      const result = await connect.mutateAsync(candidate.id);
      setHelloCard({ candidate, conversationId: result.conversationId });
      void conversations.refetch();
    } catch {
      setHelloCard(null);
    }
  };

  return (
    <section className="clink-panel">
      <SectionLabel icon={<ClinkIcon />} label="HIGHEST CHEMISTRY MATCHES TONIGHT" />
      {candidates.isLoading ? <StatusCard label="Loading nearby drinking buddies" /> : null}
      {candidates.isError ? <StatusCard tone="error" label={candidates.error.message} /> : null}
      <div className="stack">
        {orderedCandidates.map((candidate) => {
          const profile = getCandidateProfile(candidate);
          const clinked = savedChatIds.includes(candidate.id);

          return (
          <article className="clink-match-card" key={candidate.id}>
            <div className="clink-match-main">
              <div className="match-avatar" style={{ "--avatar-color": profile.avatarColor } as CSSProperties}>
                <img src={candidate.avatarUrl ? resolveMediaUrl(candidate.avatarUrl) : getDefaultAvatarDataUri(candidate.id || candidate.displayName)} alt="" />
              </div>
              <div className="clink-match-body">
                <div className="clink-match-title">
                  <strong>{candidate.displayName}</strong>
                  <em className="clink-drunkti-badge">{profile.drunkTi}</em>
                </div>
                <small>
                  <MapPin size={11} />
                  {profile.bar} <b>/</b> Favors: {profile.favors}
                </small>
              </div>
              <div className="clink-score">
                <span>METRIC</span>
                <strong>{profile.score}% Match</strong>
              </div>
            </div>
            <blockquote>{candidate.reason ?? profile.quote}</blockquote>
            <button
              className={`match-chat-button ${clinked ? "is-clinked" : ""}`}
              type="button"
              disabled={connect.isPending}
              onClick={() => void openChat(candidate)}
            >
              <ClinkIcon />
              {clinked ? "CLINKED - CHAT NOW" : "CLINK GLASSES"}
            </button>
          </article>
        );
        })}
        {!candidates.isLoading && !(candidates.data ?? []).length ? <StatusCard label="No match candidates returned." /> : null}
      </div>
      {helloCard ? (
        <div className="clink-hello-scrim" role="dialog" aria-modal="true" aria-label="Glasses clinked">
          <section className="clink-hello-card">
            <div className="clink-hello-icon"><ClinkIcon size={24} /></div>
            <h2>GLASSES CLINKED!</h2>
            <span>DIRECT PATHWAY OPENED</span>
            <p>
              You matched with <strong>{helloCard.candidate.displayName}</strong>. Her taste profile aligned perfectly with yours!
            </p>
            <button
              className="clink-hello-primary"
              type="button"
              onClick={() => {
                setHelloCard(null);
                onOpenClinks({
                  id: helloCard.conversationId,
                  peerAvatarUrl: helloCard.candidate.avatarUrl,
                  peerDisplayName: helloCard.candidate.displayName,
                  peerUserId: helloCard.candidate.id,
                  title: helloCard.candidate.displayName
                });
              }}
            >
              Say Hello
            </button>
            <button className="clink-hello-dismiss" type="button" onClick={() => setHelloCard(null)}>Dismiss Radar</button>
          </section>
        </div>
      ) : null}
    </section>
  );
}

function getCandidateProfile(candidate: MatchCandidate) {
  const profiles = [
    {
      avatarColor: "#a5211d",
      bar: "Lantern Bar",
      drunkTi: "INFJ",
      emoji: "NB",
      favors: "Classic Martini",
      quote: "A quiet listener who prefers dry gin, old jazz, and the corner booth after midnight.",
      score: 90
    },
    {
      avatarColor: "#f0a43d",
      bar: "The Botanist",
      drunkTi: "ESTP",
      emoji: "SL",
      favors: "Vibrant Negroni",
      quote: "High social energy around Donghu Rd, always ready to trade cocktail secrets over one more round.",
      score: 90
    },
    {
      avatarColor: "#214b34",
      bar: "Union Trading",
      drunkTi: "INTP",
      emoji: "UT",
      favors: "Smoky Highball",
      quote: "Breaks every drink into aroma, ice, and mood variables. Best for a slow last-round conversation.",
      score: 86
    }
  ];
  const charTotal = candidate.id.concat(candidate.displayName).split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  const profile = profiles[charTotal % profiles.length];

  return {
    ...profile,
    score: candidate.hasTodayCheckIn ? profile.score + 2 : profile.score,
    quote: candidate.reason ?? profile.quote
  };
}

function ClinkIcon({ size = 16 }: { size?: number }) {
  return (
    <svg className="clink-icon" viewBox="0 0 24 24" aria-hidden="true" height={size} width={size}>
      <path d="M8.7 4.2 4.3 7.1l3.4 5.1 4.4-2.9Z" />
      <path d="m15.3 4.2 4.4 2.9-3.4 5.1-4.4-2.9Z" />
      <path d="m9.6 11.8-2.2 5.6" />
      <path d="m14.4 11.8 2.2 5.6" />
      <path d="M5.2 19.3h5" />
      <path d="M13.8 19.3h5" />
      <path d="M10.1 8.9h3.8" />
    </svg>
  );
}

function ChatPanel({
  conversations,
  initialConversationFallback,
  initialConversationId,
  onInitialConversationOpened
}: {
  conversations: ReturnType<typeof useConversationsQuery>;
  initialConversationFallback: PendingClinkConversation | null;
  initialConversationId: string | null;
  onInitialConversationOpened: () => void;
}) {
  const user = useAuthStore((state) => state.user);
  const allConversations = conversations.data?.items ?? [];
  const visibleConversations = (conversations.data?.items ?? []).slice(0, 3);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeConversationFallback, setActiveConversationFallback] = useState<PendingClinkConversation | null>(null);
  const [lockedChatShellHeight, setLockedChatShellHeight] = useState<number | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const activeConversation =
    allConversations.find((conversation) => conversation.id === activeConversationId) ??
    (activeConversationFallback?.id === activeConversationId ? activeConversationFallback : null);
  const messages = useConversationMessagesQuery(activeConversationId ?? "");
  const sendMessage = useMutation({
    mutationFn: ({ body, conversationId }: { body: string; conversationId: string }) =>
      chatApi.sendMessage(conversationId, body),
    onSuccess: () => {
      setMessageDraft("");
      void messages.refetch();
      void conversations.refetch();
    }
  });

  useEffect(() => {
    if (!initialConversationId) {
      return;
    }

    setLockedChatShellHeight(getClinkChatShellHeight());
    setActiveConversationId(initialConversationId);
    setActiveConversationFallback(initialConversationFallback);
    onInitialConversationOpened();
  }, [initialConversationFallback, initialConversationId, onInitialConversationOpened]);

  const openConversation = (conversationId: string, fallbackConversation: PendingClinkConversation | null = null) => {
    setLockedChatShellHeight(getClinkChatShellHeight());
    setActiveConversationId(conversationId);
    setActiveConversationFallback(fallbackConversation);
    setMessageDraft("");
  };

  const submitMessage = () => {
    const body = messageDraft.trim();
    if (!body || !activeConversationId) {
      return;
    }

    sendMessage.mutate({ body, conversationId: activeConversationId });
  };

  if (activeConversation) {
    const name = activeConversation.peerDisplayName ?? activeConversation.title;
    const fallback = getConversationFallbackProfile(Math.max(0, visibleConversations.findIndex((conversation) => conversation.id === activeConversation.id)));

    return (
      <section
        className="clink-chat-shell"
        style={{ "--clink-chat-shell-height": lockedChatShellHeight ? `${lockedChatShellHeight}px` : undefined } as CSSProperties}
        aria-label={`Chat with ${name}`}
      >
        <div className="clink-chat-backline">
          <button
            className="match-chat-back"
            type="button"
            onClick={() => {
              setActiveConversationId(null);
              setActiveConversationFallback(null);
              setLockedChatShellHeight(null);
              setMessageDraft("");
            }}
            aria-label="Back to clinks"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="match-chat-person">
            <div className="match-chat-avatar" style={{ "--avatar-color": fallback.avatarColor } as CSSProperties}>
              <img src={activeConversation.peerAvatarUrl ? resolveMediaUrl(activeConversation.peerAvatarUrl) : getDefaultAvatarDataUri(activeConversation.peerUserId || name)} alt="" />
            </div>
            <span>
              <strong>{name}</strong>
              <small>Clink conversation</small>
            </span>
          </div>
        </div>
        <div className="clink-message-list">
          {messages.isLoading ? <StatusCard label="Loading messages" /> : null}
          {messages.isError ? <StatusCard tone="error" label={messages.error.message} /> : null}
          {(messages.data?.items ?? []).map((message) => (
            <p key={message.id} className={`clink-message-bubble ${message.senderId === user?.id ? "mine" : "theirs"}`}>
              {message.body}
            </p>
          ))}
          {!messages.isLoading && !(messages.data?.items ?? []).length ? (
            <small>No messages yet. Start with a tiny pour.</small>
          ) : null}
        </div>
        <div className="clink-compose">
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
      <SectionLabel icon={<MessageCircle size={17} />} label="CLINKS" />
      {conversations.isLoading ? <StatusCard label="Loading chats" /> : null}
      {conversations.isError ? <StatusCard tone="error" label={conversations.error.message} /> : null}
      <div className="clink-chat-list">
        {visibleConversations.map((conversation, index) => {
          const fallback = getConversationFallbackProfile(index);
          const name = conversation.peerDisplayName ?? conversation.title;

          return (
          <button
            className="match-card clink-conversation-card"
            key={conversation.id}
            type="button"
            onClick={() => {
              openConversation(conversation.id);
            }}
          >
            <div className="match-avatar" style={{ "--avatar-color": fallback.avatarColor } as CSSProperties}>
              <img src={conversation.peerAvatarUrl ? resolveMediaUrl(conversation.peerAvatarUrl) : getDefaultAvatarDataUri(conversation.peerUserId || name)} alt="" />
            </div>
            <div className="clink-conversation-body">
              <strong>{name}</strong>
              <span>{conversation.lastMessage ?? "Say hello and open the next pour..."}</span>
            </div>
            <time>{formatConversationTime(conversation.updatedAt)}</time>
            <ChevronRight size={17} />
          </button>
        );
        })}
        {!conversations.isLoading && !visibleConversations.length ? <StatusCard label="No clinks returned." /> : null}
      </div>
    </>
  );
}

function getConversationFallbackProfile(index: number) {
  const profiles = [
    { avatarColor: "#a5211d", emoji: "🧜" },
    { avatarColor: "#f0a43d", emoji: "🦊" },
    { avatarColor: "#214b34", emoji: "🥃" }
  ];

  return profiles[index % profiles.length];
}

function formatConversationTime(value?: string) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function BarAdCarousel({
  activeIndex,
  onChange,
  onApplyBarPrompt,
  onOpenBoozerMap,
  slides
}: {
  activeIndex: number;
  onChange: (index: number) => void;
  onApplyBarPrompt: (query: string) => void;
  onOpenBoozerMap: () => void;
  slides: BarAdSlide[];
}) {
  const activeSlide = slides[activeIndex] ?? slides[0];
  const dragStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const goTo = (nextIndex: number) => {
    onChange((nextIndex + slides.length) % slides.length);
  };
  const startDrag = (clientX: number) => {
    dragStartX.current = clientX;
  };
  const finishDrag = (clientX: number) => {
    if (dragStartX.current === null) {
      return;
    }

    const delta = clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(delta) < 42) {
      return;
    }

    didSwipe.current = true;
    goTo(activeIndex + (delta < 0 ? 1 : -1));
    window.setTimeout(() => {
      didSwipe.current = false;
    }, 200);
  };

  useEffect(() => {
    if (!slides.length) {
      return;
    }

    const duration = activeSlide.isBoozerMap ? 8000 : 6000;
    const timer = window.setTimeout(() => {
      goTo(activeIndex + 1);
    }, duration);

    return () => window.clearTimeout(timer);
  }, [activeIndex, activeSlide.isBoozerMap, slides.length]);

  return (
    <section className="bar-ad-carousel" aria-label="Bar event ads">
      <article
        className={`bar-ad-slide ${activeSlide.isBoozerMap ? "is-boozer-map" : ""}`}
        onMouseDown={(event) => startDrag(event.clientX)}
        onMouseUp={(event) => finishDrag(event.clientX)}
        onClick={activeSlide.isBoozerMap ? () => {
          if (!didSwipe.current) {
            onOpenBoozerMap();
          }
        } : undefined}
        onKeyDown={activeSlide.isBoozerMap ? (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpenBoozerMap();
          }
        } : undefined}
        onTouchEnd={(event) => finishDrag(event.changedTouches[0]?.clientX ?? 0)}
        onTouchStart={(event) => startDrag(event.changedTouches[0]?.clientX ?? 0)}
        role={activeSlide.isBoozerMap ? "button" : undefined}
        style={activeSlide.imageUrl ? { "--ad-image": `url(${activeSlide.imageUrl})` } as CSSProperties : undefined}
        tabIndex={activeSlide.isBoozerMap ? 0 : undefined}
      >
        {activeSlide.isBoozerMap ? (
          <div className="bar-ad-map" aria-hidden="true">
            <span className="bar-ad-route" />
            {boozerMapPoints.map((point) => (
              <i key={point.id} style={{ left: `${point.left}%`, top: `${point.top}%` }} />
            ))}
          </div>
        ) : null}
        <div className="bar-ad-copy">
          <span>{activeSlide.kicker}</span>
          <strong>{activeSlide.title}</strong>
          <p>{activeSlide.copy}</p>
          {activeSlide.isBoozerMap ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenBoozerMap();
              }}
            >
              {activeSlide.cta}
            </button>
          ) : (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onApplyBarPrompt(activeSlide.query ?? activeSlide.title);
              }}
            >
              {activeSlide.cta}
            </button>
          )}
        </div>
      </article>
      <div className="bar-ad-dots" aria-label="Choose event ad">
        {slides.map((slide, index) => (
          <button
            aria-label={`Show ${slide.title}`}
            className={index === activeIndex ? "active" : ""}
            key={slide.id}
            onClick={() => onChange(index)}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}

function BoozerMapModal({ onClose, visible }: { onClose: () => void; visible: boolean }) {
  const [litPoints, setLitPoints] = useState<Set<string>>(() => new Set());

  if (!visible) {
    return null;
  }

  const togglePoint = (pointId: string) => {
    setLitPoints((current) => {
      const next = new Set(current);
      if (next.has(pointId)) {
        next.delete(pointId);
      } else {
        next.add(pointId);
      }
      return next;
    });
  };

  return (
    <div className="modal-scrim" role="dialog" aria-modal="true" aria-label="Boozer map route">
      <section className="boozer-map-modal">
        <div className="modal-topbar">
          <strong>酒鬼地图 · FRENCH CONCESSION LOOP</strong>
          <button type="button" onClick={onClose} aria-label="Close boozer map"><X size={17} /></button>
        </div>
        <div className="boozer-map-canvas">
          <span className="boozer-map-path" />
          {boozerMapPoints.map((point, index) => (
            <button
              className={`boozer-map-point ${litPoints.has(point.id) ? "is-lit" : ""}`}
              key={point.id}
              onClick={() => togglePoint(point.id)}
              style={{ left: `${point.left}%`, top: `${point.top}%` } as CSSProperties}
              type="button"
            >
              <b>{index + 1}</b>
              <small>{point.label}</small>
            </button>
          ))}
        </div>
        <p>French Concession route progress: {litPoints.size}/{boozerMapPoints.length} checkpoints lit.</p>
      </section>
    </div>
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
          <span><b>{index + 1}</b></span>
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

function PageHeader({ subtitle, title }: { subtitle: string; title: string }) {
  const city = useHeaderCity();

  return (
    <header className="screen-header">
      <p><b>BarLog</b><i /><MapPin size={10} />{city}</p>
      <h1>{title}</h1>
      <span>{subtitle}</span>
    </header>
  );
}

function useHeaderCity() {
  const [city, setCity] = useState("Locating");

  useEffect(() => {
    if (!navigator.geolocation) {
      setCity("Current City");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCity(inferCityName(position.coords.latitude, position.coords.longitude));
      },
      () => {
        setCity("Current City");
      },
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000, timeout: 8000 }
    );
  }, []);

  return city;
}

function inferCityName(lat: number, lng: number) {
  const knownCities = [
    { name: "Shanghai", lat: 31.2304, lng: 121.4737 },
    { name: "Singapore", lat: 1.3521, lng: 103.8198 },
    { name: "Beijing", lat: 39.9042, lng: 116.4074 },
    { name: "Shenzhen", lat: 22.5431, lng: 114.0579 },
    { name: "Guangzhou", lat: 23.1291, lng: 113.2644 },
    { name: "Hangzhou", lat: 30.2741, lng: 120.1551 },
    { name: "Chengdu", lat: 30.5728, lng: 104.0668 }
  ];
  const nearest = knownCities
    .map((city) => ({
      ...city,
      distance: Math.hypot(city.lat - lat, city.lng - lng)
    }))
    .sort((first, second) => first.distance - second.distance)[0];

  return nearest && nearest.distance < 1.2 ? nearest.name : "Current City";
}

function Screen({ children, subtitle, title }: { children: ReactNode; subtitle: string; title: string }) {
  return (
    <section className="screen">
      <PageHeader title={title} subtitle={subtitle} />
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

function Stat({
  active,
  icon,
  label,
  onClick,
  statusLabel,
  unit,
  value
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  statusLabel: string;
  unit: string;
  value: string;
}) {
  return (
    <button className={`stat-card ${active ? "active" : ""}`} onClick={onClick} type="button">
      <span className="stat-topline">
        <span className="stat-icon">{icon}</span>
        {active ? <i className="stat-pulse" /> : <em>{statusLabel}</em>}
      </span>
      <span className="stat-body">
        <strong>{value}<small>{unit}</small></strong>
        <span>{label}</span>
      </span>
    </button>
  );
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
  const [completedResult, setCompletedResult] = useState<DrunkTiResult | null>(null);
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

    const result = createDrunkTiResult(nextAnswers);
    onSave(result);
    setCompletedResult(result);
    setStep(0);
    setAnswers({});
  };

  const close = () => {
    setStep(0);
    setAnswers({});
    setCompletedResult(null);
    onClose();
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setCompletedResult(null);
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
        {completedResult ? (
          <>
            <DrunkTiResultCard result={completedResult} />
            <div className="drunkti-result-actions">
              <button type="button" onClick={close}>Save to Me</button>
              <button type="button" onClick={restart}>Retake</button>
            </div>
          </>
        ) : (
          <>
            <div className="question-block">
              <span>STEP {step + 1} OF {drunkTiQuestions.length}</span>
              <h2>{currentQuestion.text}</h2>
            </div>
            <div className="answer-list">
              {currentQuestion.options.map((option, index) => (
                <button key={option.value} className="answer-card" type="button" onClick={() => choose(currentQuestion.axis, option.value)}>
                  <b>{["A", "B", "C", "D"][index]}</b>
                  <span>
                    <strong>{option.title}</strong>
                    <small>{option.subtitle}</small>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function DrunkTiResultCard({ result, variant = "modal" }: { result: DrunkTiResult; variant?: "modal" | "profile" }) {
  return (
    <article className={`drunkti-result-card ${variant === "profile" ? "is-profile" : ""}`}>
      <div className="drunkti-result-topline">
        <span>ALCOHOL PERSONALITY CERTIFICATE</span>
        <b>{result.code}</b>
      </div>
      <div>
        <strong>{result.name}</strong>
        <p>{result.tagline}</p>
      </div>
      <div className="profile-drunk-ti-stats">
        {result.stats.map((stat) => (
          <i key={stat.label}>
            <b>{stat.label}</b>
            <em><span style={{ "--stat-color": stat.color, "--stat-value": `${stat.value}%` } as CSSProperties} /></em>
            <small>{stat.value}%</small>
          </i>
        ))}
      </div>
    </article>
  );
}

function LogCard({ onOpenCard, sip }: { onOpenCard: (sip: CheckIn) => void; sip: CheckIn }) {
  return (
    <button className="log-card" type="button" onClick={() => onOpenCard(sip)}>
      <DrinkIcon name={sip.drinkName} type={sip.drinkCategory} />
      <div>
        <strong>{sip.drinkName}</strong>
        <span>{sip.barName ?? sip.city ?? "Unknown place"}</span>
        <small>{sip.drinkCategory.toUpperCase()} · {formatShortDate(sip.createdAt)}</small>
      </div>
      <b>{sip.rating?.toFixed(1) ?? "-"}</b>
    </button>
  );
}

function CheckInCardModal({ onClose, sip }: { onClose: () => void; sip: CheckIn }) {
  return (
    <div className="checkin-card-scrim" role="dialog" aria-modal="true" aria-label={`${sip.drinkName} check-in card`}>
      <section className="checkin-card-sheet">
        <button className="checkin-card-close" type="button" onClick={onClose} aria-label="Close check-in card">
          <X size={15} />
        </button>
        <CheckInCardPreview sip={sip} />
      </section>
    </div>
  );
}

function CheckInCardPreview({ sip }: { sip: CheckIn }) {
  const hasGeneratedCard = Boolean(sip.cardImageUrl);
  const imageSrc = resolveMediaUrl(sip.cardImageUrl ?? sip.photoUrl);

  return (
    <article className={`checkin-card-preview ${hasGeneratedCard ? "has-generated-card" : ""}`}>
      {imageSrc ? <img src={imageSrc} alt="" /> : null}
      {!hasGeneratedCard ? (
        <div className="checkin-card-copy">
          <p>BARLOG CHECK-IN</p>
          <h2>{sip.drinkName}</h2>
          <span>{sip.barName ?? sip.area ?? sip.city ?? "Tonight"}</span>
          <small>{sip.vibeMumbling ?? `${sip.drinkCategory.toUpperCase()} · ${formatShortDate(sip.createdAt)}`}</small>
          <b>{sip.rating?.toFixed(1) ?? "-"}/5</b>
        </div>
      ) : null}
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
  const variant = getDrinkIconVariant(name, type);

  return (
    <div className={`drink-icon drink-icon-${variant}`} aria-label={`${name} icon`}>
      <DrinkIconSvg variant={variant} />
    </div>
  );
}

function DrinkIconSvg({ variant }: { variant: DrinkIconVariant }) {
  switch (variant) {
    case "white-russian":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <RocksGlass liquid="#3B2417" liquidTop={52} />
          <path d="M 30,43 C 38,37 45,48 52,42 C 60,35 67,42 72,39 L 71,52 C 58,58 44,51 29,56 Z" fill="#F8EFE4" />
          <IceCube x={38} y={57} rotate={-12} />
          <IceCube x={54} y={63} rotate={14} />
        </svg>
      );
    case "black-russian":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <RocksGlass liquid="#17110D" liquidTop={43} />
          <ellipse cx="50" cy="37" rx="7" ry="4" fill="#2F1F16" transform="rotate(-16 50 37)" />
          <path d="M 45,36 C 48,38 52,38 55,35" fill="none" stroke="#6B4A34" strokeWidth="1.5" />
        </svg>
      );
    case "margarita":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path d="M 21,22 L 79,22 L 61,49 C 57,55 43,55 39,49 Z" fill="#A7F3D0" />
          <path d="M 18,19 C 32,15 68,15 82,19" fill="none" stroke="#F8FAFC" strokeWidth="5" strokeLinecap="round" strokeDasharray="3 4" />
          <path d="M 21,22 L 79,22 L 61,49 C 57,55 43,55 39,49 Z" fill="none" stroke="#F5F1E9" strokeWidth="4" opacity="0.45" />
          <path d="M 50,53 L 50,84 M 33,84 L 67,84" stroke="#F5F1E9" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
          <circle cx="73" cy="38" r="10" fill="#84CC16" />
          <circle cx="73" cy="38" r="6" fill="#ECFCCB" />
        </svg>
      );
    case "cosmopolitan":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <StemGlass fill="#BE185D" />
          <path d="M 70,20 C 83,27 66,32 75,41" fill="none" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case "whiskey-sour":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <RocksGlass liquid="#D97706" liquidTop={52} />
          <path d="M 29,40 C 38,31 47,42 55,35 C 63,29 70,36 72,44 L 72,53 C 57,58 43,50 28,55 Z" fill="#FFF7E6" />
          <circle cx="43" cy="43" r="2" fill="#7F1D1D" />
          <circle cx="53" cy="41" r="1.8" fill="#7F1D1D" />
          <path d="M 61,35 L 76,25" stroke="#9F1239" strokeWidth="2" />
          <circle cx="75" cy="24" r="4" fill="#B91C1C" />
        </svg>
      );
    case "aperol-spritz":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path d="M 30,24 C 24,52 35,75 50,75 C 65,75 76,52 70,24 Z" fill="#F97316" />
          <path d="M 28,21 C 34,17 66,17 72,21 C 78,54 65,80 50,80 C 35,80 22,54 28,21 Z" fill="none" stroke="#F5F1E9" strokeWidth="4" opacity="0.45" />
          <path d="M 50,79 L 50,88 M 36,88 L 64,88" stroke="#F5F1E9" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
          <IceCube x={40} y={45} rotate={15} />
          <IceCube x={55} y={39} rotate={-10} />
          <circle cx="63" cy="32" r="10" fill="#FDBA74" />
          <circle cx="42" cy="61" r="1.7" fill="#FFF7ED" />
          <circle cx="52" cy="51" r="1.4" fill="#FFF7ED" />
          <circle cx="58" cy="64" r="1.2" fill="#FFF7ED" />
        </svg>
      );
    case "tequila-sunrise":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <HighballGlass>
            <defs>
              <linearGradient id="sunriseGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="52%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#BE123C" />
              </linearGradient>
            </defs>
            <path d="M 34,28 L 66,28 L 63,86 L 37,86 Z" fill="url(#sunriseGradient)" />
            <path d="M 65,23 L 75,12" stroke="#F8FAFC" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="76" cy="12" r="5" fill="#B91C1C" />
          </HighballGlass>
        </svg>
      );
    case "retro-negroni":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <RocksGlass liquid="#991B1B" liquidTop={45} />
          <IceCube x={40} y={54} rotate={12} />
          <path d="M 22,37 C 35,29 42,37 48,45" fill="none" stroke="#F97316" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
    case "blue-moon":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <StemGlass fill="#0EA5E9" />
          <circle cx="68" cy="28" r="8" fill="#FB923C" />
          <ellipse cx="58" cy="25" rx="8" ry="4" fill="#16A34A" transform="rotate(-28 58 25)" />
        </svg>
      );
    case "old-fashioned":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <RocksGlass liquid="#B45309" liquidTop={52} />
          <IceCube x={39} y={55} rotate={-5} />
          <circle cx="44" cy="76" r="6" fill="#991B1B" />
          <path d="M 70,30 C 64,43 76,49 68,63" fill="none" stroke="#F97316" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      );
    case "martini":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <StemGlass fill="#F1F5F9" />
          <path d="M 32,18 L 64,44" stroke="#D1D5DB" strokeWidth="1.8" />
          <circle cx="48" cy="31" r="5" fill="#65A30D" />
          <circle cx="58" cy="39" r="5" fill="#65A30D" />
        </svg>
      );
    case "gimlet":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <StemGlass fill="#D9F99D" />
        </svg>
      );
    case "manhattan":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <StemGlass fill="#7F1D1D" />
          <circle cx="51" cy="34" r="5" fill="#B91C1C" />
        </svg>
      );
    case "wine":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path d="M 50,55 L 50,85 M 36,85 L 64,85" stroke="#F5F1E9" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
          <path d="M 30,22 C 30,55 70,55 70,22 Z" fill="none" stroke="#F5F1E9" strokeWidth="3.5" opacity="0.45" />
          <path d="M 31,35 C 33,52 67,52 69,35 Z" fill="#881337" />
          <path d="M 42,34 C 48,39 56,39 64,34" fill="none" stroke="#FBCFE8" strokeWidth="2" opacity="0.6" />
        </svg>
      );
    case "beer":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path d="M 62,35 C 77,35 77,66 62,66" fill="none" stroke="#F5F1E9" strokeWidth="5" opacity="0.45" />
          <path d="M 31,27 L 65,27 L 60,86 C 60,89 58,90 55,90 L 40,90 C 37,90 35,89 35,86 Z" fill="#D97706" />
          <path d="M 29,28 C 29,21 36,18 42,22 C 46,17 52,18 55,22 C 59,18 65,21 65,28 C 65,35 29,35 29,28 Z" fill="#F8FAFC" />
          <path d="M 31,27 L 65,27 L 60,86 C 60,89 58,90 55,90 L 40,90 C 37,90 35,89 35,86 Z" fill="none" stroke="#F5F1E9" strokeWidth="4" opacity="0.42" />
        </svg>
      );
    case "sake":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path d="M 38,25 C 38,18 62,18 62,25 L 66,78 C 66,86 34,86 34,78 Z" fill="#DCEAE5" />
          <path d="M 38,25 C 38,18 62,18 62,25 L 66,78 C 66,86 34,86 34,78 Z" fill="none" stroke="#F5F1E9" strokeWidth="4" opacity="0.45" />
          <path d="M 40,54 C 48,48 55,60 63,53" fill="none" stroke="#7BA99B" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="50" cy="24" rx="12" ry="5" fill="#B7D1C8" />
        </svg>
      );
    case "generic":
    default:
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <linearGradient id="genericDrinkGradient" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="48%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#BE185D" />
            </linearGradient>
          </defs>
          <StemGlass fill="url(#genericDrinkGradient)" />
          <path d="M 30,35 C 40,28 49,42 59,34 C 65,30 69,31 74,35" fill="none" stroke="#F8FAFC" strokeWidth="2.3" opacity="0.8" />
        </svg>
      );
  }
}

function RocksGlass({ liquid, liquidTop }: { liquid: string; liquidTop: number }) {
  return (
    <>
      <path d="M 25,24 L 75,24 L 70,85 C 70,88 67,90 64,90 L 36,90 C 33,90 30,88 30,85 Z" fill="none" stroke="#F5F1E9" strokeWidth="4" opacity="0.45" />
      <path d={`M 28,${liquidTop} L 72,${liquidTop} L 69,82 C 69,85 67,87 64,87 L 36,87 C 33,87 31,85 31,82 Z`} fill={liquid} />
      <path d={`M 28,${liquidTop} Q 50,${liquidTop + 4} 72,${liquidTop}`} fill="none" stroke="#F8FAFC" strokeWidth="2" opacity="0.35" />
    </>
  );
}

function StemGlass({ fill }: { fill: string }) {
  return (
    <>
      <path d="M 50,50 L 50,85 M 33,85 L 67,85" stroke="#F5F1E9" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <path d="M 23,22 L 77,22 L 50,52 Z" fill={fill} opacity="0.96" />
      <path d="M 19,18 L 81,18 L 50,52 Z" fill="none" stroke="#F5F1E9" strokeWidth="4" opacity="0.42" />
    </>
  );
}

function HighballGlass({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <path d="M 32,20 L 68,20 L 64,88 C 64,89 63,90 62,90 L 38,90 C 37,90 36,89 36,88 Z" fill="none" stroke="#F5F1E9" strokeWidth="4" opacity="0.45" />
    </>
  );
}

function IceCube({ x, y, rotate }: { x: number; y: number; rotate: number }) {
  return <rect x={x} y={y} width="18" height="18" rx="3" fill="#E2E8F0" opacity="0.62" transform={`rotate(${rotate} ${x + 9} ${y + 9})`} />;
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

