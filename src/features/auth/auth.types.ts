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

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken?: string;
};
