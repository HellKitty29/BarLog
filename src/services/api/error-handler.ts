import { AxiosError } from "axios";
import type { ApiErrorBody } from "@/types/api";

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status?: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  const axiosError = error as AxiosError<ApiErrorBody>;
  const body = axiosError.response?.data;
  return new ApiError(
    body?.message ?? axiosError.message ?? "Unexpected API error",
    axiosError.response?.status,
    body?.code,
    body?.details
  );
}
