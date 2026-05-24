import { Camera } from "expo-camera";

export async function requestCameraPermission() {
  const permission = await Camera.requestCameraPermissionsAsync();
  return permission.granted;
}
