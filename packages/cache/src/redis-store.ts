import { CacheStore } from './types';

export interface RedisClientInterface {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ...args: any[]): Promise<any>;
  del(key: string): Promise<any>;
  flushdb?(): Promise<any>;
  exists(key: string): Promise<number>;
}

export class RedisCacheStore implements CacheStore {
  constructor(
    private client: RedisClientInterface,
    private prefix: string = 'volt:cache:'
  ) {}

  private prefixed(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(this.prefixed(key));
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const k = this.prefixed(key);
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(k, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(k, value);
    }
  }

  async delete(key: string): Promise<boolean> {
    const res = await this.client.del(this.prefixed(key));
    return res > 0;
  }

  async clear(): Promise<void> {
    if (this.client.flushdb) {
      await this.client.flushdb();
    }
  }

  async has(key: string): Promise<boolean> {
    const res = await this.client.exists(this.prefixed(key));
    return res > 0;
  }
}
