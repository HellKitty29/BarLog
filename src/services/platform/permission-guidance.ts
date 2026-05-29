import type { LocationAccessErrorCode } from "@/services/location/location-service";
import { canOpenSystemSettings, getPermissionProfile } from "./device-platform";

type Guidance = {
  title: string;
  message: string;
  action: "retry" | "settings" | "none";
  actionLabel?: string;
};

export type PermissionGuidance = Guidance;

export function getLocationGuidance(code: LocationAccessErrorCode): Guidance {
  const profile = getPermissionProfile();

  if (code === "services_disabled") {
    return {
      title: "定位服务未开启",
      message: profile.includes("ios")
        ? "请在系统设置中打开「定位服务」，并允许浏览器或 BarLog 使用位置。"
        : "请在系统设置中打开定位/GPS，并允许浏览器使用位置。",
      action: "retry",
      actionLabel: "重试"
    };
  }

  if (code === "permission_blocked") {
    return {
      title: "定位权限已被拒绝",
      message: getLocationBlockedMessage(profile),
      action: canOpenSystemSettings() ? "settings" : "retry",
      actionLabel: canOpenSystemSettings() ? "打开系统设置" : "重试"
    };
  }

  return {
    title: "需要定位权限",
    message: getLocationDeniedMessage(profile),
    action: "retry",
    actionLabel: "重试"
  };
}

function getLocationDeniedMessage(profile: ReturnType<typeof getPermissionProfile>) {
  switch (profile) {
    case "ios-web":
      return "请在 Safari 地址栏左侧点击「aA」→「网站设置」→ 允许「位置」，然后点重试。需使用 HTTPS 访问。";
    case "android-web":
      return "请在 Chrome 地址栏点击锁图标 →「权限」→ 允许「位置」，然后点重试。";
    case "desktop-web":
      return "请在浏览器地址栏允许此网站使用位置，然后点重试。";
    case "ios-native":
      return "请允许 BarLog 使用定位，以便查找附近酒吧。";
    case "android-native":
      return "请允许 BarLog 使用定位，以便查找附近酒吧。";
    default:
      return "请允许定位权限后重试。";
  }
}

function getLocationBlockedMessage(profile: ReturnType<typeof getPermissionProfile>) {
  switch (profile) {
    case "ios-web":
      return "Safari 已禁止此网站定位。请打开 iPhone「设置」→「Safari」→「位置」，或在该网站设置里改为「允许」。";
    case "android-web":
      return "Chrome 已禁止此网站定位。请打开站点信息 → 权限 → 位置 → 允许。";
    case "desktop-web":
      return "浏览器已禁止此网站定位。请在站点设置中重新允许位置访问。";
    case "ios-native":
      return "请在 iPhone「设置」→「BarLog」中允许定位。";
    case "android-native":
      return "请在 Android 设置 → 应用 → BarLog → 权限 中允许定位。";
    default:
      return "定位权限已被系统拒绝，请在设置中手动开启。";
  }
}

export function getCameraGuidance(granted: boolean): Guidance {
  if (granted) {
    return {
      title: "相机已授权",
      message: "",
      action: "none"
    };
  }

  const profile = getPermissionProfile();

  switch (profile) {
    case "ios-web":
      return {
        title: "无法使用相机",
        message: "iPhone 浏览器对相机限制较多。建议点「从相册选择」上传照片；若需拍照，请确保使用 HTTPS，并在 Safari 网站设置中允许相机。",
        action: "none"
      };
    case "android-web":
      return {
        title: "需要相机权限",
        message: "请在 Chrome 站点权限中允许相机，或改用「从相册选择」上传照片。",
        action: "none"
      };
    case "desktop-web":
      return {
        title: "需要相机权限",
        message: "请在浏览器中允许相机访问，或改用「从相册/文件选择」上传照片。",
        action: "none"
      };
    case "ios-native":
      return {
        title: "需要相机权限",
        message: "请在系统弹窗中允许 BarLog 使用相机。",
        action: "settings",
        actionLabel: "打开设置"
      };
    case "android-native":
      return {
        title: "需要相机权限",
        message: "请在系统弹窗中允许 BarLog 使用相机。",
        action: "settings",
        actionLabel: "打开设置"
      };
    default:
      return {
        title: "需要相机权限",
        message: "请允许相机权限后重试。",
        action: canOpenSystemSettings() ? "settings" : "retry",
        actionLabel: canOpenSystemSettings() ? "打开设置" : "重试"
      };
  }
}

export function getMediaLibraryGuidance(granted: boolean): Guidance {
  if (granted) {
    return {
      title: "相册已授权",
      message: "",
      action: "none"
    };
  }

  const profile = getPermissionProfile();

  return {
    title: "需要相册权限",
    message: profile.includes("web")
      ? "请在浏览器文件/相册选择器中选取图片。若未弹出，请检查站点权限或改用 Safari/Chrome 打开。"
      : "请允许 BarLog 访问相册以选择打卡照片。",
    action: canOpenSystemSettings() ? "settings" : "none",
    actionLabel: canOpenSystemSettings() ? "打开设置" : undefined
  };
}
