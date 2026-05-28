import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View, StyleSheet } from "react-native";
import { AppCard } from "@/components/common/AppCard";
import { AppHeader } from "@/components/common/AppHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingView } from "@/components/common/LoadingView";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { useDiaryCalendarQuery, useDiarySummaryQuery, useRecentSipsQuery } from "@/features/diary/diary.queries";
import { createDrunkTiResult, drunkTiQuestions, type DrunkTiResult } from "@/features/persona/drunkti";
import { useDrunkTiStore } from "@/features/persona/drunkti.store";
import { useCurrentMonth } from "@/hooks/useCurrentMonth";
import { colors, spacing, typography } from "@/theme";
import type { CheckIn } from "@/types/domain";

export default function DiaryScreen() {
  const currentMonth = useCurrentMonth();
  const [month, setMonth] = useState(currentMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDrunkTiOpen, setIsDrunkTiOpen] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [logCategory, setLogCategory] = useState<LogCategoryFilter>("all");
  const drunkTiResult = useDrunkTiStore((state) => state.result);
  const setDrunkTiResult = useDrunkTiStore((state) => state.setResult);
  const summary = useDiarySummaryQuery(month);
  const calendar = useDiaryCalendarQuery(month);
  const recentSips = useRecentSipsQuery();
  const recentSipItems = useMemo(() => recentSips.data?.items ?? [], [recentSips.data?.items]);
  const visibleSipItems = useMemo(() => {
    const searchValue = logSearch.trim().toLowerCase();

    return recentSipItems.filter((sip) => {
      const matchesDate = selectedDate ? getDateKey(sip.createdAt) === selectedDate : true;
      const matchesCategory = logCategory === "all" ? true : isLogInCategory(sip.drinkCategory, logCategory);
      const searchableText = [
        sip.drinkName,
        sip.barName,
        sip.city,
        sip.area,
        sip.vibeMumbling,
        ...(sip.moodTags ?? [])
      ].filter(Boolean).join(" ").toLowerCase();
      const matchesSearch = searchValue ? searchableText.includes(searchValue) : true;

      return matchesDate && matchesCategory && matchesSearch;
    });
  }, [logCategory, logSearch, recentSipItems, selectedDate]);
  const checkInCount = summary.data?.checkInCount;
  const barsVisited = summary.data?.barsVisited;
  const averageRating = summary.data?.averageRating;
  const calendarDays = Array.isArray(calendar.data) ? calendar.data : [];

  return (
    <ScrollScreen>
      <View style={styles.diaryHeader}>
        <AppHeader title="Diary" subtitle="Your personal drinking archive." />
        <Pressable onPress={() => setIsDrunkTiOpen(true)} style={({ pressed }) => [styles.drunkTiButton, pressed && styles.pressed]}>
          <Ionicons name="planet-outline" size={14} color="#faf6ee" />
          <Text style={styles.drunkTiText}>DrunkTI</Text>
          {drunkTiResult ? <Text style={styles.drunkTiCode}>{drunkTiResult.code}</Text> : null}
        </Pressable>
      </View>
      {summary.isError ? <ErrorState message={summary.error.message} /> : null}

      <View style={styles.statsBlock}>
        <View style={styles.microHeader}>
          <Ionicons name="sparkles" size={13} color="#c68334" />
          <Text style={styles.microTitle}>BARLOG MY MICRO STATS</Text>
        </View>
        <View style={styles.stats}>
          <StatCard
            icon={<MaterialCommunityIcons name="glass-cocktail" size={17} color="#c68334" />}
            label="TOTAL LOGS"
            meta="LOGS"
            value={summary.isLoading ? "..." : String(checkInCount ?? 0)}
          />
          <StatCard
            icon={<Ionicons name="location" size={17} color="#c68334" />}
            label="EXPLORED"
            meta="BARS"
            value={summary.isLoading ? "..." : String(barsVisited ?? 0)}
          />
          <StatCard
            icon={<Ionicons name="star" size={17} color="#c68334" />}
            label="AVG RATING"
            meta="PTS"
            value={summary.isLoading ? "..." : averageRating?.toFixed(1) ?? "-"}
          />
        </View>
      </View>

      <DiaryCalendarPanel
        days={calendarDays}
        isLoading={calendar.isLoading}
        logs={recentSipItems}
        month={month}
        onMonthChange={setMonth}
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
      />

      <View style={styles.logsHeaderRow}>
        <Text style={styles.logsHeaderTitle}>RECENT LOGS</Text>
        <View style={styles.logsHeaderRule} />
      </View>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={15} color="#8e7e73" />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setLogSearch}
          placeholder="Search drinks, bars, or diary notes..."
          placeholderTextColor="#6f6158"
          style={styles.searchInput}
          value={logSearch}
        />
        {logSearch ? (
          <Pressable onPress={() => setLogSearch("")} hitSlop={8}>
            <Ionicons name="close-circle" size={15} color="#8e7e73" />
          </Pressable>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryTabs}>
        {logCategoryTabs.map((item) => {
          const isSelected = logCategory === item.key;

          return (
            <Pressable
              key={item.key}
              onPress={() => setLogCategory(item.key)}
              style={[styles.categoryTab, isSelected && styles.categoryTabActive]}
            >
              <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {recentSips.isLoading ? <LoadingView label="Loading recent sips" /> : null}
      {recentSips.isError ? <ErrorState message={recentSips.error.message} /> : null}
      {visibleSipItems.length ? (
        visibleSipItems.map((sip) => (
          <AppCard key={sip.id}>
            <View style={styles.logCard}>
              <DrinkBadge category={sip.drinkCategory} drinkName={sip.drinkName} />
              <View style={styles.logBody}>
                <Text numberOfLines={1} style={styles.cardTitle}>
                  {sip.drinkName}
                </Text>
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={13} color="#c68334" />
                  <Text numberOfLines={1} style={styles.cardMeta}>
                    {sip.barName ?? sip.city ?? "Unknown place"}
                  </Text>
                </View>
                <View style={styles.tagRow}>
                  <Text style={styles.tag}>{sip.drinkCategory.toUpperCase()}</Text>
                  {sip.createdAt ? <Text style={styles.tag}>{formatSipDate(sip.createdAt)}</Text> : null}
                </View>
              </View>
              <View style={styles.ratingBlock}>
                <Text style={styles.rating}>{sip.rating?.toFixed(1) ?? "-"}</Text>
                <Text style={styles.ratingMeta}>/10</Text>
              </View>
            </View>
          </AppCard>
        ))
      ) : (
        !recentSips.isLoading && <EmptyState title="No matching logs" body="Try a different search or drink category." />
      )}
      <DrunkTiModal
        onClose={() => setIsDrunkTiOpen(false)}
        onSave={(result) => {
          setDrunkTiResult(result);
          setIsDrunkTiOpen(false);
        }}
        visible={isDrunkTiOpen}
      />
    </ScrollScreen>
  );
}

type CalendarDay = {
  date: string;
  count: number;
};

type LogCategoryFilter = "all" | "cocktail" | "whisky" | "wine" | "beer" | "other";

const logCategoryTabs: { key: LogCategoryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "cocktail", label: "Cocktail" },
  { key: "whisky", label: "Whisky" },
  { key: "wine", label: "Wine" },
  { key: "beer", label: "Beer" },
  { key: "other", label: "Other" }
];

function isLogInCategory(category: string, filter: LogCategoryFilter) {
  if (filter === "other") {
    return !["cocktail", "whisky", "wine", "beer"].includes(category);
  }

  return category === filter;
}

function DiaryCalendarPanel({
  days,
  isLoading,
  logs,
  month,
  onMonthChange,
  onSelectDate,
  selectedDate
}: {
  days: CalendarDay[];
  isLoading: boolean;
  logs: CheckIn[];
  month: string;
  onMonthChange: (month: string) => void;
  onSelectDate: (date: string | null) => void;
  selectedDate: string | null;
}) {
  const monthDate = createMonthDate(month);
  const monthLabel = monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const countByDate = new Map(days.map((day) => [day.date, day.count]));
  const selectedLogs = selectedDate ? logs.filter((sip) => getDateKey(sip.createdAt) === selectedDate) : [];
  const selectedCount = selectedDate ? countByDate.get(selectedDate) ?? selectedLogs.length : 0;
  void selectedCount;
  const dayNodes = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = `${month}-${String(day).padStart(2, "0")}`;
    return {
      count: countByDate.get(date) ?? 0,
      date,
      day
    };
  });

  return (
    <View style={styles.calendarCard}>
      <View style={styles.calendarHeader}>
        <Text style={styles.calendarTitle}>{monthLabel.toUpperCase()} DRINKING DAYS</Text>
        <View style={styles.monthControls}>
          <Pressable onPress={() => onMonthChange(shiftMonth(month, -1))} style={styles.monthButton}>
            <Ionicons name="arrow-back" size={14} color="#a8988c" />
          </Pressable>
          <Text style={styles.monthSlash}>/</Text>
          <Pressable onPress={() => onMonthChange(shiftMonth(month, 1))} style={styles.monthButton}>
            <Ionicons name="arrow-forward" size={14} color="#a8988c" />
          </Pressable>
        </View>
      </View>

      <View style={styles.ropeViewport}>
        <View style={styles.rope} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ropeScroll}>
          {dayNodes.map((node) => {
            const isSelected = selectedDate === node.date;
            const hasCheckIn = node.count > 0;

            return (
              <Pressable
                key={node.date}
                onPress={() => onSelectDate(isSelected ? null : node.date)}
                style={styles.dayNode}
              >
                <View style={[
                  styles.dayDot,
                  hasCheckIn && styles.dayDotFilled,
                  isSelected && styles.dayDotSelected
                ]} />
                <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{node.day}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? <Text style={styles.calendarLoadingText}>Loading monthly knots...</Text> : null}
      {selectedDate ? (
        <View style={styles.dayInfoCard}>
          <View style={styles.dayInfoTopRow}>
            <View style={styles.dayInfoTitleRow}>
              <View style={styles.dayInfoDot} />
              <Text style={styles.dayInfoDate}>{formatSelectedDateLabel(selectedDate)}</Text>
              <Text style={styles.lockBadge}>LOCKED</Text>
            </View>
            <View style={styles.dayInfoCountRow}>
              <Ionicons name="beer-outline" size={12} color="#c68334" />
              <Text style={styles.dayInfoCount}>GOT {selectedCount} DRINKS</Text>
            </View>
          </View>
          <View style={styles.dayInfoRule} />
          {selectedLogs.length ? (
            selectedLogs.slice(0, 4).map((sip) => (
              <View key={sip.id} style={styles.dayDrinkRow}>
                <Text style={styles.dayDrinkIcon}>{getDrinkEmoji(sip.drinkCategory)}</Text>
                <Text numberOfLines={1} style={styles.dayDrinkName}>{sip.drinkName}</Text>
                <Text numberOfLines={1} style={styles.dayDrinkPlace}>
                  @{sip.barName ?? sip.area ?? sip.city ?? "Unknown"}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.dayInfoEmpty}>No logs returned for this date yet.</Text>
          )}
          <Text style={styles.unlockHint}>Click day again to unlock</Text>
        </View>
      ) : null}
    </View>
  );
}

function DiaryCalendar({
  days,
  isLoading,
  logs,
  month,
  onMonthChange,
  onSelectDate,
  selectedDate
}: {
  days: CalendarDay[];
  isLoading: boolean;
  logs: CheckIn[];
  month: string;
  onMonthChange: (month: string) => void;
  onSelectDate: (date: string | null) => void;
  selectedDate: string | null;
}) {
  const monthDate = createMonthDate(month);
  const monthLabel = monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const countByDate = new Map(days.map((day) => [day.date, day.count]));
  const selectedLogs = selectedDate ? logs.filter((sip) => getDateKey(sip.createdAt) === selectedDate) : [];
  const selectedCount = selectedDate ? countByDate.get(selectedDate) ?? selectedLogs.length : 0;
  void selectedCount;
  const dayNodes = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = `${month}-${String(day).padStart(2, "0")}`;
    return {
      count: countByDate.get(date) ?? 0,
      date,
      day
    };
  });

  return (
    <View style={styles.calendarCard}>
      <View style={styles.calendarHeader}>
        <Text style={styles.calendarTitle}>{monthLabel.toUpperCase()} DRINKING DAYS</Text>
        <View style={styles.monthControls}>
          <Pressable onPress={() => onMonthChange(shiftMonth(month, -1))} style={styles.monthButton}>
            <Ionicons name="arrow-back" size={14} color="#a8988c" />
          </Pressable>
          <Text style={styles.monthSlash}>/</Text>
          <Pressable onPress={() => onMonthChange(shiftMonth(month, 1))} style={styles.monthButton}>
            <Ionicons name="arrow-forward" size={14} color="#a8988c" />
          </Pressable>
        </View>
      </View>

      <View style={styles.ropeViewport}>
        <View style={styles.rope} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ropeScroll}>
          {dayNodes.map((node) => {
            const isSelected = selectedDate === node.date;
            const hasCheckIn = node.count > 0;

            return (
              <Pressable
                key={node.date}
                onPress={() => onSelectDate(isSelected ? null : node.date)}
                style={styles.dayNode}
              >
                <View style={[
                  styles.dayDot,
                  hasCheckIn && styles.dayDotFilled,
                  isSelected && styles.dayDotSelected
                ]} />
                <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{node.day}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.calendarDetail}>
        <View style={[styles.detailPulse, selectedDate ? styles.detailPulseActive : null]} />
        <Text style={styles.calendarDetailText}>
          {isLoading
            ? "Loading monthly knots..."
            : selectedDate
              ? `${selectedDate} · ${countByDate.get(selectedDate) ?? 0} drinks logged`
              : "Swipe timeline and tap knots to filter recent logs"}
        </Text>
      </View>
    </View>
  );
}

void DiaryCalendar;

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

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modalScrim}>
        <View style={styles.drunkTiModal}>
          <View style={styles.modalTopBar}>
            <Text style={styles.modalTitle}>DRINKING MBTI TEST</Text>
            <Pressable onPress={onClose} style={styles.modalClose}>
              <Ionicons name="close" size={17} color="#faf6ee" />
            </Pressable>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <View style={styles.questionBlock}>
            <Text style={styles.questionStep}>STEP {step + 1} OF {drunkTiQuestions.length}</Text>
            <Text style={styles.questionText}>{currentQuestion.text}</Text>
          </View>

          <View style={styles.answerList}>
            {currentQuestion.options.map((option, index) => (
              <Pressable key={option.value} onPress={() => choose(currentQuestion.axis, option.value)} style={styles.answerCard}>
                <Text style={styles.answerIndex}>{index === 0 ? "A" : "B"}</Text>
                <View style={styles.answerCopy}>
                  <Text style={styles.answerTitle}>{option.title}</Text>
                  <Text style={styles.answerSub}>{option.subtitle}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function StatCard({
  icon,
  label,
  meta,
  value
}: {
  icon: ReactNode;
  label: string;
  meta: string;
  value: string;
}) {
  return (
    <LinearGradient colors={["#1d0c0b", "#140807"]} style={styles.statCard}>
      <View style={styles.statTopRow}>
        <View style={styles.statIcon}>{icon}</View>
        <Text style={styles.statMeta}>{meta}</Text>
      </View>
      <View style={styles.statValueRow}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.metric}>
          {value}
        </Text>
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.label}>
        {label}
      </Text>
    </LinearGradient>
  );
}

function DrinkBadge({ category, drinkName }: { category: string; drinkName: string }) {
  const normalizedName = drinkName.toLowerCase();
  const iconName = category === "beer"
    ? "beer-outline"
    : category === "wine"
      ? "wine-outline"
      : normalizedName.includes("whisky") || category === "whisky"
        ? "cube-outline"
        : "wine";

  return (
    <View style={styles.drinkBadge}>
      <Ionicons name={iconName} size={25} color="#faf6ee" />
      <View style={styles.badgeGlow} />
    </View>
  );
}

function formatSelectedDateLabel(value: string) {
  const parsed = new Date(`${value}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const day = parsed.toLocaleDateString("en-US", { weekday: "short" });
  return `${value} (${day})`;
}

function getDrinkEmoji(category: string) {
  if (category === "beer") {
    return "🍺";
  }

  if (category === "wine") {
    return "🍷";
  }

  return "🍸";
}

function formatSipDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDateKey(value?: string) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 10);
  }

  return parsed.toISOString().slice(0, 10);
}

function createMonthDate(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, (monthNumber || 1) - 1, 1);
}

function shiftMonth(month: string, offset: number) {
  const date = createMonthDate(month);
  date.setMonth(date.getMonth() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }]
  },
  diaryHeader: {
    position: "relative"
  },
  drunkTiButton: {
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "#10291d",
    borderColor: "rgba(159, 191, 143, 0.42)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    marginTop: -6,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  drunkTiText: {
    color: "#faf6ee",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8
  },
  drunkTiCode: {
    backgroundColor: "rgba(159,191,143,0.22)",
    borderRadius: 8,
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 5,
    paddingVertical: 2
  },
  statsBlock: {
    gap: spacing.sm
  },
  microHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 2
  },
  microTitle: {
    color: "#a8988c",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4
  },
  stats: {
    flexDirection: "row",
    gap: spacing.sm
  },
  statCard: {
    borderColor: "rgba(74, 23, 21, 0.7)",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minHeight: 116,
    padding: 12
  },
  statTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 13
  },
  statIcon: {
    alignItems: "center",
    backgroundColor: "#24100e",
    borderRadius: 10,
    height: 30,
    justifyContent: "center",
    width: 30
  },
  statMeta: {
    color: "#5a4f48",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  statValueRow: {
    minHeight: 34,
    justifyContent: "flex-end"
  },
  metric: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 33
  },
  label: {
    color: "#ebe4d5",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginTop: 5
  },
  logCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  logsHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 2
  },
  logsHeaderTitle: {
    color: "#c68334",
    fontSize: 14,
    fontStyle: "italic",
    fontWeight: "600",
    letterSpacing: 1.1
  },
  logsHeaderRule: {
    backgroundColor: "rgba(74, 23, 21, 0.56)",
    flex: 1,
    height: 1
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: "rgba(18, 6, 5, 0.72)",
    borderColor: "rgba(139, 30, 25, 0.48)",
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 12
  },
  searchInput: {
    color: "#faf6ee",
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    minWidth: 0,
    paddingVertical: 0
  },
  categoryTabs: {
    gap: 7,
    paddingRight: 18
  },
  categoryTab: {
    alignItems: "center",
    backgroundColor: "rgba(27, 9, 8, 0.78)",
    borderColor: "rgba(74, 23, 21, 0.62)",
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 31,
    paddingHorizontal: 12
  },
  categoryTabActive: {
    backgroundColor: "#bd2b25",
    borderColor: "#e0443d",
    shadowColor: "#bd2b25",
    shadowOpacity: 0.34,
    shadowRadius: 11
  },
  categoryTabText: {
    color: "#a8988c",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3
  },
  categoryTabTextActive: {
    color: "#fff4ec"
  },
  drinkBadge: {
    alignItems: "center",
    backgroundColor: "#62132a",
    borderColor: "rgba(198, 131, 52, 0.2)",
    borderRadius: 15,
    borderWidth: 1,
    height: 76,
    justifyContent: "center",
    overflow: "hidden",
    width: 76
  },
  badgeGlow: {
    backgroundColor: "rgba(198, 131, 52, 0.16)",
    borderRadius: 26,
    height: 52,
    position: "absolute",
    right: -22,
    top: -18,
    width: 52
  },
  logBody: {
    flex: 1,
    minWidth: 0
  },
  cardTitle: {
    ...typography.heading,
    color: colors.text,
    fontSize: 21,
    lineHeight: 27
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 4
  },
  cardMeta: {
    ...typography.caption,
    color: "#c8bcb1",
    flex: 1
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 9
  },
  tag: {
    backgroundColor: "#24100e",
    borderColor: "rgba(74, 23, 21, 0.8)",
    borderRadius: 999,
    borderWidth: 1,
    color: "#c68334",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.4,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  ratingBlock: {
    alignItems: "flex-end",
    minWidth: 42
  },
  rating: {
    color: "#c68334",
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 34
  },
  ratingMeta: {
    color: "#8e7e73",
    fontSize: 10,
    fontWeight: "900"
  },
  calendarCard: {
    backgroundColor: "rgba(19, 7, 6, 0.92)",
    borderColor: "rgba(62, 26, 23, 0.7)",
    borderRadius: 24,
    borderWidth: 1,
    padding: 15
  },
  calendarHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12
  },
  calendarTitle: {
    color: "#faf6ee",
    flex: 1,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1
  },
  monthControls: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5
  },
  monthButton: {
    padding: 6
  },
  monthSlash: {
    color: "rgba(168, 152, 140, 0.3)",
    fontSize: 10,
    fontWeight: "900"
  },
  ropeViewport: {
    backgroundColor: "rgba(9, 3, 2, 0.88)",
    borderColor: "#2d1614",
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 76,
    overflow: "hidden",
    position: "relative"
  },
  rope: {
    backgroundColor: "#5d3f28",
    borderRadius: 999,
    height: 5,
    left: 18,
    opacity: 0.9,
    position: "absolute",
    right: 18,
    top: 34
  },
  ropeScroll: {
    alignItems: "center",
    gap: 12,
    minHeight: 76,
    paddingHorizontal: 22
  },
  dayNode: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 22
  },
  dayDot: {
    backgroundColor: "#3a1e1c",
    borderRadius: 4,
    height: 8,
    width: 8
  },
  dayDotFilled: {
    backgroundColor: "#8b1e19",
    borderRadius: 6,
    height: 12,
    width: 12
  },
  dayDotSelected: {
    backgroundColor: "#c68334",
    borderColor: "#faf6ee",
    borderWidth: 2,
    height: 16,
    width: 16
  },
  dayText: {
    color: "#7f736b",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 7
  },
  dayTextSelected: {
    color: "#faf6ee"
  },
  calendarDetail: {
    alignItems: "center",
    backgroundColor: "#180c0b",
    borderColor: "#3a1412",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    minHeight: 43,
    paddingHorizontal: 12
  },
  detailPulse: {
    backgroundColor: "#4a1715",
    borderRadius: 4,
    height: 8,
    width: 8
  },
  detailPulseActive: {
    backgroundColor: "#cd2e26"
  },
  calendarDetailText: {
    color: "#a8988c",
    flex: 1,
    fontSize: 11,
    fontStyle: "italic",
    fontWeight: "700"
  },
  calendarLoadingText: {
    color: "#a8988c",
    fontSize: 10,
    fontStyle: "italic",
    fontWeight: "700",
    marginTop: 10
  },
  dayInfoCard: {
    backgroundColor: "rgba(20, 7, 6, 0.86)",
    borderColor: "rgba(74, 23, 21, 0.74)",
    borderRadius: 18,
    borderWidth: 1,
    gap: 9,
    marginTop: 13,
    paddingHorizontal: 14,
    paddingVertical: 13
  },
  dayInfoTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between"
  },
  dayInfoTitleRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 7,
    minWidth: 0
  },
  dayInfoDot: {
    backgroundColor: "#cd2e26",
    borderRadius: 5,
    height: 9,
    width: 9
  },
  dayInfoDate: {
    color: "#c8bcb1",
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  lockBadge: {
    backgroundColor: "#bd2b25",
    borderRadius: 5,
    color: "#fff4ec",
    fontSize: 8,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 5,
    paddingVertical: 2
  },
  dayInfoCountRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5
  },
  dayInfoCount: {
    color: "#c68334",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6
  },
  dayInfoRule: {
    backgroundColor: "rgba(74, 23, 21, 0.7)",
    height: 1
  },
  dayDrinkRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    minHeight: 24
  },
  dayDrinkIcon: {
    fontSize: 13,
    width: 18
  },
  dayDrinkName: {
    color: "#faf6ee",
    flex: 1,
    fontSize: 14,
    fontWeight: "900"
  },
  dayDrinkPlace: {
    color: "#c8bcb1",
    flex: 0.9,
    fontSize: 11,
    fontStyle: "italic",
    fontWeight: "700",
    textAlign: "right"
  },
  dayInfoEmpty: {
    color: "#a8988c",
    fontSize: 11,
    fontStyle: "italic",
    fontWeight: "700"
  },
  unlockHint: {
    alignSelf: "flex-end",
    color: "#9b5f24",
    fontSize: 10,
    fontStyle: "italic",
    fontWeight: "800"
  },
  filterPillRow: {
    alignItems: "center",
    backgroundColor: "rgba(29, 12, 11, 0.72)",
    borderColor: "rgba(74, 23, 21, 0.45)",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  filterPill: {
    color: "#a8988c",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  clearFilter: {
    color: "#c68334",
    fontSize: 10,
    fontWeight: "900"
  },
  modalScrim: {
    alignItems: "center",
    backgroundColor: "rgba(8, 1, 1, 0.72)",
    flex: 1,
    justifyContent: "center",
    padding: 18
  },
  drunkTiModal: {
    backgroundColor: "#0d1f17",
    borderColor: "#214b34",
    borderRadius: 26,
    borderWidth: 3,
    maxWidth: 360,
    overflow: "hidden",
    paddingBottom: 18,
    width: "100%"
  },
  modalTopBar: {
    alignItems: "center",
    backgroundColor: "#10291d",
    borderBottomColor: "#214b34",
    borderBottomWidth: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  modalTitle: {
    color: "#faf6ee",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1
  },
  modalClose: {
    alignItems: "center",
    backgroundColor: "#214b34",
    borderRadius: 8,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  progressTrack: {
    backgroundColor: "#1a100e",
    height: 6,
    margin: 18,
    overflow: "hidden",
    borderRadius: 999
  },
  progressFill: {
    backgroundColor: "#6f9b61",
    height: "100%"
  },
  questionBlock: {
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 10
  },
  questionStep: {
    color: "#9fbf8f",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1
  },
  questionText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 24
  },
  answerList: {
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 8
  },
  answerCard: {
    backgroundColor: "#08150f",
    borderColor: "#214b34",
    borderRadius: 18,
    borderWidth: 2,
    flexDirection: "row",
    gap: 11,
    padding: 14
  },
  answerIndex: {
    color: "#9fbf8f",
    fontSize: 12,
    fontWeight: "900",
    width: 18
  },
  answerCopy: {
    flex: 1,
    gap: 4
  },
  answerTitle: {
    color: "#faf6ee",
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 18
  },
  answerSub: {
    color: "#a8988c",
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 16
  },
  resultCard: {
    backgroundColor: "#1c0908",
    borderColor: "#411411",
    borderRadius: 22,
    borderWidth: 3,
    gap: 12,
    padding: 14
  },
  resultTopLine: {
    alignItems: "center",
    borderBottomColor: "rgba(74, 23, 21, 0.56)",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 8
  },
  resultEyebrow: {
    color: "#a8988c",
    flex: 1,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1
  },
  resultCode: {
    backgroundColor: "#8b1e19",
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
    backgroundColor: "#0d0504",
    borderColor: "#431411",
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: "row",
    gap: 12,
    padding: 11
  },
  resultAvatar: {
    alignItems: "center",
    backgroundColor: "#1e0f0d",
    borderColor: "#431411",
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
    color: "#c68334",
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 15,
    marginTop: 3,
    textTransform: "uppercase"
  },
  resultStatsGrid: {
    backgroundColor: "#130706",
    borderColor: "#2d1614",
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
    backgroundColor: "#231210",
    borderRadius: 999,
    height: 5,
    overflow: "hidden"
  },
  resultTrackFill: {
    height: "100%"
  },
  retakeButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#2b0e0d",
    borderColor: "#431411",
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 36
  },
  retakeText: {
    color: "#faf6ee",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7
  }
});
