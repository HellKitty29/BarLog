import type { CheckIn, DrinkCategory } from "@/types/domain";

export type DiaryFilterKey = "all" | "brew" | DrinkCategory;

export const diaryFilterOptions: { key: DiaryFilterKey; label: string; categories?: DrinkCategory[] }[] = [
  { key: "all", label: "All" },
  { key: "cocktail", label: "Cocktail", categories: ["cocktail"] },
  { key: "brew", label: "Brew", categories: ["beer"] },
  { key: "wine", label: "Wine", categories: ["wine"] },
  { key: "beer", label: "Beer", categories: ["beer"] },
  { key: "whisky", label: "Whisky", categories: ["whisky"] },
  { key: "sake", label: "Sake", categories: ["sake"] },
  { key: "mocktail", label: "Mocktail", categories: ["mocktail"] }
];

export function getDiaryAnchorDate(month: string, currentDate = new Date()) {
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  if (currentMonth === month) {
    return `${month}-${String(currentDate.getDate()).padStart(2, "0")}`;
  }

  return `${month}-01`;
}

export function filterDiaryLogs(
  logs: readonly CheckIn[],
  {
    category,
    search,
    selectedDate
  }: {
    category: DiaryFilterKey;
    search: string;
    selectedDate: string | null;
  }
) {
  const query = search.trim().toLowerCase();
  const filter = diaryFilterOptions.find((option) => option.key === category);

  return logs.filter((item) => {
    const text = [item.drinkName, item.barName, item.city, item.vibeMumbling, ...(item.moodTags ?? [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch = query ? text.includes(query) : true;
    const matchesDate = selectedDate ? dateKey(item.createdAt) === selectedDate : true;
    const matchesCategory = filter?.categories?.length ? filter.categories.includes(item.drinkCategory) : true;

    return matchesSearch && matchesDate && matchesCategory;
  });
}

export function getSelectedDiaryDay(logs: readonly CheckIn[], selectedDate: string | null, countByDate: Map<string, number>) {
  if (!selectedDate) {
    return null;
  }

  const dayLogs = logs.filter((sip) => dateKey(sip.createdAt) === selectedDate);
  return {
    count: countByDate.get(selectedDate) ?? dayLogs.length,
    dateLabel: formatSelectedDateLabel(selectedDate),
    logs: dayLogs
  };
}

export function formatSelectedDateLabel(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  const weekday = Number.isNaN(parsed.getTime()) ? "" : ` (${parsed.toLocaleDateString("en-US", { weekday: "short" })})`;
  return `${date}${weekday}`;
}

function dateKey(value: string) {
  return value.slice(0, 10);
}
