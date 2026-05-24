export type ApiEnvelope<T> = {
  data: T;
  message?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  nextCursor?: string;
};

export type ApiErrorBody = {
  message?: string;
  code?: string;
  details?: unknown;
};
