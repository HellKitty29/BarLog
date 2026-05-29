import { Platform } from "react-native";

export type WebMobileOs = "ios" | "android" | "desktop";
export type PermissionProfile =
  | "ios-native"
  | "android-native"
  | "ios-web"
  | "android-web"
  | "desktop-web";

export function getWebMobileOs(): WebMobileOs | null {
  if (Platform.OS !== "web" || typeof navigator === "undefined") {
    return null;
  }

  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return "ios";
  }
  if (/Android/i.test(ua)) {
    return "android";
  }

  return "desktop";
}

export function getPermissionProfile(): PermissionProfile {
  if (Platform.OS === "ios") {
    return "ios-native";
  }
  if (Platform.OS === "android") {
    return "android-native";
  }

  const webOs = getWebMobileOs();
  if (webOs === "ios") {
    return "ios-web";
  }
  if (webOs === "android") {
    return "android-web";
  }

  return "desktop-web";
}

export function isMobileWeb() {
  const webOs = getWebMobileOs();
  return webOs === "ios" || webOs === "android";
}

/** 原生 App 才能跳转系统设置；浏览器里 Linking.openSettings 无效 */
export function canOpenSystemSettings() {
  return Platform.OS === "ios" || Platform.OS === "android";
}

/** Web 上相机能力受限，优先引导相册 / 文件选择 */
export function prefersLibraryOverCamera() {
  return Platform.OS === "web";
}
