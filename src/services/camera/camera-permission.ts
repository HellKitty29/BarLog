import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

export async function requestCameraPermission() {
  if (Platform.OS === "android") {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    return permission.granted;
  }

  const permission = await Camera.requestCameraPermissionsAsync();
  return permission.granted;
}
