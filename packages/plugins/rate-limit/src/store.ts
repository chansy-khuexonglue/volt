import { RateLimitClientRecord, RateLimitStore } from './types';

export class MemoryRateLimitStore implements RateLimitStore {
  private hits = new Map<string, RateLimitClientRecord>();
  private cleanupTimer: any;

  constructor(cleanupIntervalMs = 60_000) {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.hits.entries()) {
        if (now > data.resetTime) {
          this.hits.delete(key);
        }
      }
    }, cleanupIntervalMs);
    this.cleanupTimer?.unref?.();
  }

  increment(key: string, windowMs: number): RateLimitClientRecord {
    const now = Date.now();
    let record = this.hits.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      this.hits.set(key, record);
    } else {
      record.count++;
    }

    return record;
  }

  reset(key: string): void {
    this.hits.delete(key);
  }

  close(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.hits.clear();
  }
}
