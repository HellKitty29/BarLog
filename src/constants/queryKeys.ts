export const queryKeys = {
  authMe: ["auth", "me"] as const,
  diarySummary: (month: string) => ["diary", "summary", month] as const,
  recentSips: ["checkins", "recent"] as const,
  nearbyBars: (city?: string) => ["bars", "nearby", city] as const,
  barDetail: (barId: string) => ["bars", "detail", barId] as const,
  galleryFeed: (city?: string) => ["gallery", "feed", city] as const,
  userProfile: ["users", "me"] as const,
  drinkCollection: ["drinks", "collection"] as const,
  conversations: ["chat", "conversations"] as const,
  conversationMessages: (conversationId: string) => ["chat", "messages", conversationId] as const,
  matchCandidates: ["match", "candidates"] as const
};
