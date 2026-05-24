import * as Sharing from "expo-sharing";

export async function shareImage(uri: string) {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
  }
}
