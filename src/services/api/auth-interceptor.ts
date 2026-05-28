import type { AxiosInstance } from "axios";
import { getAccessToken } from "@/services/storage/token-storage";

export function attachAuthInterceptor(client: AxiosInstance) {
  client.interceptors.request.use(async (config) => {
    let token: string | null = null;

    try {
      token = await getAccessToken();
    } catch {
      token = null;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });
}
