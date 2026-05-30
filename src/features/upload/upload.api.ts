import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { UploadImageResponse } from "./upload.types";

const multipartConfig = {
  headers: {
    "Content-Type": undefined as unknown as string
  }
};

export const uploadApi = {
  uploadImage: (formData: FormData) =>
    apiClient.post<UploadImageResponse>(endpoints.uploads.image, formData, multipartConfig),
  uploadCardImage: (formData: FormData) =>
    apiClient.post<UploadImageResponse>(endpoints.uploads.card, formData, multipartConfig)
};
