import type { CheckIn } from "@/types/domain";

export type DiarySummary = {
  month: string;
  checkInCount: number;
  barsVisited: number;
  averageRating?: number;
  currentStreak?: number;
};

export type DiaryCalendarDay = {
  date: string;
  count: number;
};

export type DiaryStats = {
  categoryCounts: Record<string, number>;
  moodCounts: Record<string, number>;
};

export type RecentSipsResponse = {
  items: CheckIn[];
};
