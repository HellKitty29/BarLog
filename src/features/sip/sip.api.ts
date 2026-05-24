import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { CheckIn } from "@/types/domain";
import type { CreateCheckInPayload } from "./sip.types";

export const sipApi = {
  createCheckIn: (payload: CreateCheckInPayload) =>
    apiClient.post<CheckIn>(endpoints.checkins.create, payload),
  deleteCheckIn: (checkinId: string) =>
    apiClient.delete<void>(endpoints.checkins.detail(checkinId))
};
