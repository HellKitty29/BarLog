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

  if (typeof window !== "undefined" && url.startsWith("/")) {
    return `${window.location.origin}${url}`;
  }

  return url;
}
