import { CacheStore } from './types';

interface CacheEntry {
  value: string;
  expiresAt: number | null;
}

export class MemoryCacheStore implements CacheStore {
  private cache = new Map<string, CacheEntry>();
  private maxItems: number;

  constructor(options: { maxItems?: number } = {}) {
    this.maxItems = options.maxItems || 5000;
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU position
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: string, value: string, ttlSeconds?: number): void {
    if (this.cache.size >= this.maxItems) {
      // Evict oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.cache.set(key, { value, expiresAt });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  size(): number {
    return this.cache.size;
  }
}
