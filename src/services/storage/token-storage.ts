import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "barlog.accessToken";
const REFRESH_TOKEN_KEY = "barlog.refreshToken";

async function readItem(key: string) {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function writeItem(key: string, value: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function removeItem(key: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export async function getAccessToken() {
  return readItem(ACCESS_TOKEN_KEY);
}

export async function setAccessToken(token: string) {
  await writeItem(ACCESS_TOKEN_KEY, token);
}

export async function getRefreshToken() {
  return readItem(REFRESH_TOKEN_KEY);
}

export async function setRefreshToken(token: string) {
  await writeItem(REFRESH_TOKEN_KEY, token);
}

export async function clearTokens() {
  await Promise.all([removeItem(ACCESS_TOKEN_KEY), removeItem(REFRESH_TOKEN_KEY)]);
}
