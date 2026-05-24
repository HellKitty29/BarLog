import AsyncStorage from "@react-native-async-storage/async-storage";

export const draftStorage = {
  async getJson<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  async setJson<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  remove: (key: string) => AsyncStorage.removeItem(key)
};
