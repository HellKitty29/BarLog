import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "@/types/domain";

const SESSION_KEY = "barlog.user.v1";

export type LocalSessionUser = User & {
  email: string;
};

export async function getLocalSessionUser() {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as LocalSessionUser;
  } catch {
    await AsyncStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export async function saveLocalSessionUser(user: LocalSessionUser) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export async function clearLocalSessionUser() {
  await AsyncStorage.removeItem(SESSION_KEY);
}
