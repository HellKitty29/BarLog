const viteEnv = typeof import.meta !== "undefined" ? import.meta.env : undefined;
const processEnv = typeof process !== "undefined" ? process.env : undefined;

function getApiBaseUrl() {
  const healthApiUrl =
    viteEnv?.VITE_HEALTH_API_URL ??
    viteEnv?.EXPO_PUBLIC_HEALTH_API_URL ??
    processEnv?.EXPO_PUBLIC_HEALTH_API_URL;

  return (
    viteEnv?.VITE_API_BASE_URL ??
    viteEnv?.EXPO_PUBLIC_API_BASE_URL ??
    processEnv?.EXPO_PUBLIC_API_BASE_URL ??
    healthApiUrl?.replace(/\/health\/?$/, "")
  );
}

export function resolveMediaUrl(url?: string | null): string {
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url) || url.startsWith("blob:") || url.startsWith("data:")) {
    if (url.includes("barlog.local")) {
      return "";
    }
    return url;
  }

  if (url.startsWith("/")) {
    const apiBaseUrl = getApiBaseUrl();
    if (apiBaseUrl) {
      return `${apiBaseUrl.replace(/\/$/, "")}${url}`;
    }
  }

  if (typeof window !== "undefined" && url.startsWith("/")) {
    return `${window.location.origin}${url}`;
  }

  return url;
}
