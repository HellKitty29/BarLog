import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { MatchAnswerPayload, MatchCandidate } from "./match.types";

export const matchApi = {
  createSession: () => apiClient.post<{ sessionId: string }>(endpoints.match.session),
  answer: (payload: MatchAnswerPayload) =>
    apiClient.post<void>(endpoints.match.answer, payload),
  getCandidates: () =>
    apiClient.get<MatchCandidate[]>(endpoints.match.candidates),
  requestMatch: (candidateId: string) =>
    apiClient.post<void>(endpoints.match.request, { candidateId })
};
