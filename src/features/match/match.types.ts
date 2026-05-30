export type MatchCandidate = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  reason?: string;
  distanceMeters?: number;
  hasTodayCheckIn?: boolean;
};

export type MatchConnectResult = {
  conversationId: string;
  status: string;
  peer: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
};

export type MatchAnswerPayload = {
  sessionId: string;
  questionId: string;
  optionId: string;
};
