import { VoltContext } from '@voltts/core';

export interface RateLimitClientRecord {
  count: number;
  resetTime: number;
}

export interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<RateLimitClientRecord> | RateLimitClientRecord;
  reset?(key: string): Promise<void> | void;
  close?(): Promise<void> | void;
}

export interface RateLimitPluginOptions {
  /**
   * Time window in milliseconds (default: 60,000ms = 1 minute)
   */
  windowMs?: number;

  /**
   * Maximum number of connections/requests allowed within the window (default: 100)
   */
  max?: number;

  /**
   * Custom response message or payload when rate limit is exceeded
   */
  message?: string | Record<string, any>;

  /**
   * HTTP status code when limit is exceeded (default: 429)
   */
  statusCode?: number;

  /**
   * Function used to generate a unique key for the client (default: IP address)
   */
  keyGenerator?: (ctx: VoltContext) => string | Promise<string>;

  /**
   * Function to skip rate limiting for specific requests
   */
  skip?: (ctx: VoltContext) => boolean | Promise<boolean>;

  /**
   * Custom storage driver (defaults to fast in-memory store)
   */
  store?: RateLimitStore;

  /**
   * Whether to send standard RFC draft headers (RateLimit-*)
   * (default: true)
   */
  standardHeaders?: boolean;

  /**
   * Whether to send legacy headers (X-RateLimit-*)
   * (default: true)
   */
  legacyHeaders?: boolean;
}
