export interface ApiResponse<T = unknown> {
  statusCode: number;
  statusMessage: string;
  resultData: T;
  errors?: unknown;
  traceId?: string;
}

export interface ApiError {
  message?: string;
  response?: {
    status?: number;
    resultData?: unknown;
    data?: {
      statusMessage?: string;
      resultData?: unknown;
    };
  };
}

export interface DropdownOption {
  id: string | number;
  value: string;
}
