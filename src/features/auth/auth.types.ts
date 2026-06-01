import type { User } from "@/types/domain";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  displayName: string;
  email: string;
  password: string;
};

export type GoogleAuthStartPayload = {
  redirectUri: string;
  mode: "login" | "register";
};

export type GoogleAuthStartResponse = {
  authUrl: string;
};

export type GoogleAuthCompletePayload = {
  accessToken: string;
  refreshToken?: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken?: string;
};
