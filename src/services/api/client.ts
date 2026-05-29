import { create, type AxiosRequestConfig } from "axios";
import { attachAuthInterceptor } from "./auth-interceptor";
import { normalizeApiError } from "./error-handler";

const viteEnv = typeof import.meta !== "undefined" ? import.meta.env : undefined;
const processEnv = typeof process !== "undefined" ? process.env : undefined;
const healthApiUrl =
  viteEnv?.VITE_HEALTH_API_URL ??
  viteEnv?.EXPO_PUBLIC_HEALTH_API_URL ??
  processEnv?.EXPO_PUBLIC_HEALTH_API_URL;
const apiBaseUrlFromHealth = healthApiUrl?.replace(/\/health\/?$/, "");
const shouldUseLocalProxy = typeof window !== "undefined" && ["5173", "4173"].includes(window.location.port);
const browserMockBaseUrl = typeof window !== "undefined"
  ? `${window.location.protocol}//${window.location.hostname}:4000`
  : undefined;
const baseURL =
  shouldUseLocalProxy
    ? undefined
    : apiBaseUrlFromHealth ??
      viteEnv?.VITE_API_BASE_URL ??
      viteEnv?.EXPO_PUBLIC_API_BASE_URL ??
      processEnv?.EXPO_PUBLIC_API_BASE_URL ??
      browserMockBaseUrl;

if (!baseURL) {
  console.warn("VITE_HEALTH_API_URL, VITE_API_BASE_URL, EXPO_PUBLIC_HEALTH_API_URL, or EXPO_PUBLIC_API_BASE_URL is required. API requests will fail until one is configured.");
}

export const httpClient = create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

attachAuthInterceptor(httpClient);

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await httpClient.request<T>(config);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "GET", url }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "POST", url, data }),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "PUT", url, data }),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: "DELETE", url })
};
