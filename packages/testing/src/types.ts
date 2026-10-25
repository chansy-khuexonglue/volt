export interface TestRequestOptions {
  headers?: Record<string, string> | Headers;
  query?: Record<string, string | number | boolean>;
  body?: any;
}

export interface TestResponse<T = any> extends Response {
  json: () => Promise<T>;
  text: () => Promise<string>;
  data?: T;
}

export interface TestClient {
  get<T = any>(path: string, options?: TestRequestOptions): Promise<TestResponse<T>>;
  post<T = any>(path: string, options?: TestRequestOptions): Promise<TestResponse<T>>;
  put<T = any>(path: string, options?: TestRequestOptions): Promise<TestResponse<T>>;
  delete<T = any>(path: string, options?: TestRequestOptions): Promise<TestResponse<T>>;
  patch<T = any>(path: string, options?: TestRequestOptions): Promise<TestResponse<T>>;
  head(path: string, options?: TestRequestOptions): Promise<TestResponse<void>>;
  options(path: string, options?: TestRequestOptions): Promise<TestResponse<void>>;
  fetch(req: Request): Promise<Response> | Response;
}
