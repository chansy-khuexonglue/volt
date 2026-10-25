export interface PaginatedResult<T> {
  count: number;
  items: T[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
