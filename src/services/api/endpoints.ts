export const endpoints = {
  auth: {
    register: "/api/auth/register",
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    me: "/api/auth/me",
    refresh: "/api/auth/refresh"
  },
  uploads: {
    image: "/api/uploads/image",
    card: "/api/uploads/card"
  },
  sipCards: {
    detail: (checkInId: string) => `/api/sip-cards/${checkInId}`
  },
  checkins: {
    create: "/api/checkins",
    recent: "/api/checkins/recent",
    detail: (checkinId: string) => `/api/checkins/${checkinId}`,
    byUser: (userId: string) => `/api/users/${userId}/checkins`
  },
  diary: {
    summary: "/api/diary/summary",
    calendar: "/api/diary/calendar",
    stats: "/api/diary/stats"
  },
  bars: {
    nearby: "/api/bars/nearby",
    detail: (barId: string) => `/api/bars/${barId}`,
    rankings: "/api/bars/rankings",
    checkins: (barId: string) => `/api/bars/${barId}/checkins`
  },
  gallery: {
    feed: "/api/gallery/feed",
    post: (postId: string) => `/api/gallery/posts/${postId}`,
    createPost: "/api/gallery/posts",
    like: (postId: string) => `/api/gallery/posts/${postId}/like`
  },
  match: {
    session: "/api/match/session",
    answer: "/api/match/answer",
    candidates: "/api/match/candidates",
    connect: "/api/match/connect",
    request: "/api/match/request",
    respond: "/api/match/respond"
  },
  chat: {
    conversations: "/api/chat/conversations",
    messages: (conversationId: string) => `/api/chat/conversations/${conversationId}/messages`,
    read: (conversationId: string) => `/api/chat/conversations/${conversationId}/read`
  },
  ai: {
    recognizeDrink: "/api/ai/recognize-drink",
    generateCardCopy: "/api/ai/generate-card-copy",
    generatePersona: "/api/ai/generate-persona",
    matchReason: "/api/ai/match-reason",
    icebreakers: "/api/ai/icebreakers"
  }
} as const;
