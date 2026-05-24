export type MatchCandidate = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  reason?: string;
  distanceMeters?: number;
};

export type MatchAnswerPayload = {
  sessionId: string;
  questionId: string;
  optionId: string;
};
