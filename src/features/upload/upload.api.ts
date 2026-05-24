import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { UploadImageResponse } from "./upload.types";

export const uploadApi = {
  uploadImage: (formData: FormData) =>
    apiClient.post<UploadImageResponse>(endpoints.uploads.image, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
};
