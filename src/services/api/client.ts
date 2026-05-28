import { create, type AxiosRequestConfig } from "axios";
import { attachAuthInterceptor } from "./auth-interceptor";
import { normalizeApiError } from "./error-handler";

const healthApiUrl = process.env.EXPO_PUBLIC_HEALTH_API_URL;
const apiBaseUrlFromHealth = healthApiUrl?.replace(/\/health\/?$/, "");
const baseURL = apiBaseUrlFromHealth ?? process.env.EXPO_PUBLIC_API_BASE_URL;

if (!baseURL) {
  console.warn("EXPO_PUBLIC_HEALTH_API_URL or EXPO_PUBLIC_API_BASE_URL is required. API requests will fail until one is configured.");
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
