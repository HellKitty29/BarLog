import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { SipCardDetail } from "./sip-card.types";

export const sipCardApi = {
  getDetail: (checkInId: string) =>
    apiClient.get<SipCardDetail>(endpoints.sipCards.detail(checkInId))
};
