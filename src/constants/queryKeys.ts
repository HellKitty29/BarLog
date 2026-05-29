export const queryKeys = {
  authMe: ["auth", "me"] as const,
  diarySummary: (month: string) => ["diary", "summary", month] as const,
  diaryCalendar: (month: string) => ["diary", "calendar", month] as const,
  recentSips: ["checkins", "recent"] as const,
  nearbyBars: (params?: { city?: string; lat?: number; lng?: number; radiusMeters?: number } | null) =>
    ["bars", "nearby", params?.city, params?.lat, params?.lng, params?.radiusMeters] as const,
  barDetail: (barId: string) => ["bars", "detail", barId] as const,
  galleryFeed: (params?: { city?: string; range?: string }) =>
    ["gallery", "feed", params?.city ?? "all", params?.range ?? "24h"] as const,
  userProfile: ["users", "me"] as const,
  drinkCollection: ["drinks", "collection"] as const,
  conversations: ["chat", "conversations"] as const,
  conversationMessages: (conversationId: string) => ["chat", "messages", conversationId] as const,
  matchCandidates: ["match", "candidates"] as const
};
