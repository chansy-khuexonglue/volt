import { Volt, VoltPlugin } from '@volt/core';

export interface RedisOptions {
  url?: string;
  prefix?: string;
  client?: any; // external Redis client (ioredis or redis)
}

export interface VoltRedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<boolean>;
  has(key: string): Promise<boolean>;
  close?(): Promise<void> | void;
}

export class DefaultMemoryRedisClient implements VoltRedisClient {
  private store = new Map<string, { value: string; expiresAt: number | null }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt !== null && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== null;
  }

  async close(): Promise<void> {
    this.store.clear();
  }
}

export function redisPlugin(options: RedisOptions = {}): VoltPlugin {
  const prefix = options.prefix || 'volt:';
  let redisClient: VoltRedisClient;

  if (options.client) {
    redisClient = options.client;
  } else {
    // Default fast in-memory Redis-compatible store
    redisClient = new DefaultMemoryRedisClient();
  }

  return {
    name: '@volt/plugin-redis',
    version: '0.1.0',
    setup(app: Volt) {
      app.decorate('redis', redisClient);
    },
    async cleanup() {
      if (redisClient.close) {
        await redisClient.close();
      }
    },
  };
}

export default redisPlugin;
