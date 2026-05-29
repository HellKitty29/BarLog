import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

export type CameraPermissionResult = {
  granted: boolean;
  canAskAgain: boolean;
};

export async function requestCameraPermissionState(): Promise<CameraPermissionResult> {
  if (Platform.OS === "web") {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    return {
      granted: permission.granted,
      canAskAgain: permission.canAskAgain ?? true
    };
  }

  if (Platform.OS === "android") {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    return {
      granted: permission.granted,
      canAskAgain: permission.canAskAgain ?? true
    };
  }

  const permission = await Camera.requestCameraPermissionsAsync();
  return {
    granted: permission.granted,
    canAskAgain: permission.canAskAgain ?? true
  };
}

export async function requestCameraPermission() {
  const permission = await requestCameraPermissionState();
  return permission.granted;
}

export async function requestMediaLibraryPermissionState(): Promise<CameraPermissionResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return {
    granted: permission.granted,
    canAskAgain: permission.canAskAgain ?? true
  };
}

export async function requestMediaLibraryPermission() {
  const permission = await requestMediaLibraryPermissionState();
  return permission.granted;
}
