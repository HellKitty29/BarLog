import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { User } from "@/types/domain";
import type { UpdateProfilePayload } from "./profile.types";

export const profileApi = {
  updateMe: (payload: UpdateProfilePayload) =>
    apiClient.patch<User>(endpoints.users.me, payload)
};
