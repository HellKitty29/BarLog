import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { User } from "@/types/domain";
import type { AuthResponse, LoginPayload, RegisterPayload } from "./auth.types";

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>(endpoints.auth.login, payload),
  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>(endpoints.auth.register, payload),
  logout: () => apiClient.post<void>(endpoints.auth.logout),
  me: () => apiClient.get<User>(endpoints.auth.me),
  refresh: (refreshToken: string) =>
    apiClient.post<AuthResponse>(endpoints.auth.refresh, { refreshToken })
};
