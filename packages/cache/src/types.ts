export interface CacheStore {
  get(key: string): Promise<string | null> | string | null;
  set(key: string, value: string, ttlSeconds?: number): Promise<void> | void;
  delete(key: string): Promise<boolean> | boolean;
  clear(): Promise<void> | void;
  has(key: string): Promise<boolean> | boolean;
}

export interface CacheOptions {
  ttl?: number; // TTL in seconds (default: 60)
  store?: CacheStore;
  keyGenerator?: (req: Request) => string;
  etag?: boolean; // generate ETag header (default: true)
  clientCacheControl?: string; // e.g. 'public, max-age=60'
}

export interface CachedResponse {
  body: string;
  status: number;
  headers: Record<string, string>;
  createdAt: number;
  etag: string;
}
