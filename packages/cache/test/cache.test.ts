import { describe, expect, it } from 'bun:test';
import { cache, MemoryCacheStore, RedisCacheStore } from '../src/index';

describe('@voltts/cache', () => {
  it('stores and retrieves data with MemoryCacheStore', () => {
    const store = new MemoryCacheStore();
    store.set('key1', 'value1');
    expect(store.get('key1')).toBe('value1');
    expect(store.has('key1')).toBe(true);

    store.delete('key1');
    expect(store.get('key1')).toBe(null);
    expect(store.has('key1')).toBe(false);
  });

  it('expires entries based on ttl in MemoryCacheStore', async () => {
    const store = new MemoryCacheStore();
    store.set('expiring', 'data', 0.05); // 50ms

    expect(store.get('expiring')).toBe('data');
    await Bun.sleep(60);
    expect(store.get('expiring')).toBe(null);
  });

  it('caches GET responses and serves cache HIT', async () => {
    const store = new MemoryCacheStore();
    const mw = cache({ store, ttl: 10 });

    let callCount = 0;
    const mockCtx: any = {
      req: new Request('http://localhost/items'),
    };

    const handler = async () => {
      callCount++;
      return new Response(JSON.stringify({ count: callCount }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    // First request: MISS
    const res1 = (await mw(mockCtx, handler)) as Response;
    expect(res1.headers.get('X-Cache')).toBe('MISS');
    const data1 = await res1.json();
    expect(data1.count).toBe(1);
    expect(callCount).toBe(1);

    // Second request: HIT
    const res2 = (await mw(mockCtx, handler)) as Response;
    expect(res2.headers.get('X-Cache')).toBe('HIT');
    const data2 = await res2.json();
    expect(data2.count).toBe(1);
    expect(callCount).toBe(1); // handler not called again
  });

  it('handles ETag and returns 304 Not Modified', async () => {
    const store = new MemoryCacheStore();
    const mw = cache({ store });

    const req1 = new Request('http://localhost/etag-test');
    const res1 = (await mw({ req: req1 } as any, async () => {
      return new Response('Static content');
    })) as Response;

    const etag = res1.headers.get('ETag');
    expect(etag).toBeDefined();

    // Conditional request with If-None-Match
    const req2 = new Request('http://localhost/etag-test', {
      headers: { 'If-None-Match': etag! },
    });
    const res2 = (await mw({ req: req2 } as any, async () => {
      return new Response('Static content');
    })) as Response;

    expect(res2.status).toBe(304);
    expect(res2.headers.get('X-Cache')).toBe('HIT');
  });

  it('works with RedisCacheStore interface', async () => {
    const mockClientData = new Map<string, string>();
    const mockClient: any = {
      get: async (k: string) => mockClientData.get(k) || null,
      set: async (k: string, v: string) => mockClientData.set(k, v),
      del: async (k: string) => (mockClientData.delete(k) ? 1 : 0),
      exists: async (k: string) => (mockClientData.has(k) ? 1 : 0),
    };

    const redisStore = new RedisCacheStore(mockClient, 'test:');
    await redisStore.set('hello', 'world');
    expect(await redisStore.get('hello')).toBe('world');
    expect(await redisStore.has('hello')).toBe(true);

    await redisStore.delete('hello');
    expect(await redisStore.has('hello')).toBe(false);
  });
});
