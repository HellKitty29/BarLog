import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { MatchAnswerPayload, MatchCandidate, MatchConnectResult } from "./match.types";

export const matchApi = {
  createSession: () => apiClient.post<{ sessionId: string }>(endpoints.match.session),
  answer: (payload: MatchAnswerPayload) =>
    apiClient.post<void>(endpoints.match.answer, payload),
  getCandidates: () => apiClient.get<MatchCandidate[]>(endpoints.match.candidates),
  connect: (userId: string) =>
    apiClient.post<MatchConnectResult>(endpoints.match.connect, { userId }),
  requestMatch: (candidateId: string) =>
    apiClient.post<void>(endpoints.match.request, { candidateId })
};
