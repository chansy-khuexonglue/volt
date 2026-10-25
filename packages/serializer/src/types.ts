export type ResponseInitOptions = {
  status?: number;
  statusText?: string;
  headers?: HeadersInit;
};

export type Serializer<T = any> = (data: T) => string;

export interface SerializerOptions {
  detectContentType?: boolean;
}
