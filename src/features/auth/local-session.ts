import type { User } from "@/types/domain";

const SESSION_KEY = "barlog.user.v1";

export type LocalSessionUser = User & {
  email: string;
};

export async function getLocalSessionUser() {
  const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as LocalSessionUser;
  } catch {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(SESSION_KEY);
    }
    return null;
  }
}

export async function saveLocalSessionUser(user: LocalSessionUser) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
}

export async function clearLocalSessionUser() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}
