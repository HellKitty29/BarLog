import type { AxiosInstance } from "axios";
import { getAccessToken } from "@/services/storage/token-storage";

export function attachAuthInterceptor(client: AxiosInstance) {
  client.interceptors.request.use(async (config) => {
    const token = await getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });
}
