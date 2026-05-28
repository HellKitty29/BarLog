import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { CheckIn } from "@/types/domain";
import { normalizeRecentSipsResponse } from "./diary.helpers";
import type { DiaryCalendarDay, DiaryStats, DiarySummary, RecentSipsResponse } from "./diary.types";

export const diaryApi = {
  getSummary: (month: string) =>
    apiClient.get<DiarySummary>(endpoints.diary.summary, { params: { month } }),
  getCalendar: (month: string) =>
    apiClient.get<DiaryCalendarDay[]>(endpoints.diary.calendar, { params: { month } }),
  getStats: () => apiClient.get<DiaryStats>(endpoints.diary.stats),
  getRecentSips: async () => {
    const response = await apiClient.get<RecentSipsResponse | CheckIn[] | unknown>(endpoints.checkins.recent);
    return normalizeRecentSipsResponse(response);
  },
  getCheckIn: (checkinId: string) =>
    apiClient.get<CheckIn>(endpoints.checkins.detail(checkinId))
};
