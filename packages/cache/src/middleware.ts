import { MiddlewareHandler } from '@voltts/middleware';
import { MemoryCacheStore } from './memory-store';
import { CachedResponse, CacheOptions, CacheStore } from './types';

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `"${Math.abs(hash).toString(36)}"`;
}

export function cache(options: CacheOptions = {}): MiddlewareHandler {
  const store: CacheStore = options.store || new MemoryCacheStore();
  const ttl = options.ttl ?? 60;
  const useEtag = options.etag ?? true;

  const keyGenerator =
    options.keyGenerator ||
    ((req: Request) => {
      const url = new URL(req.url);
      return `${req.method}:${url.pathname}${url.search}`;
    });

  return async (c, next) => {
    // Only cache idempotent GET and HEAD requests
    if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
      return next();
    }

    const key = keyGenerator(c.req);
    const cachedRaw = await store.get(key);

    if (cachedRaw) {
      try {
        const cached: CachedResponse = JSON.parse(cachedRaw);

        // Check conditional ETag
        const ifNoneMatch = c.req.headers.get('if-none-match');
        if (useEtag && ifNoneMatch && ifNoneMatch === cached.etag) {
          return new Response(null, {
            status: 304,
            headers: {
              ETag: cached.etag,
              'X-Cache': 'HIT',
            },
          });
        }

        const headers = new Headers(cached.headers);
        headers.set('X-Cache', 'HIT');
        if (useEtag) headers.set('ETag', cached.etag);
        if (options.clientCacheControl) {
          headers.set('Cache-Control', options.clientCacheControl);
        }

        return new Response(c.req.method === 'HEAD' ? null : cached.body, {
          status: cached.status,
          headers,
        });
      } catch {
        // If cache entry was corrupted, proceed to fetch fresh
      }
    }

    // Cache Miss - execute handler
    const response = await next();

    // Only cache successful 200 OK responses
    if (response instanceof Response && response.status === 200) {
      const cloned = response.clone();
      const bodyText = await cloned.text();
      const etag = useEtag ? simpleHash(bodyText) : '';

      const headersObj: Record<string, string> = {};
      response.headers.forEach((v: string, k: string) => {
        headersObj[k] = v;
      });

      const entry: CachedResponse = {
        body: bodyText,
        status: response.status,
        headers: headersObj,
        createdAt: Date.now(),
        etag,
      };

      await store.set(key, JSON.stringify(entry), ttl);

      response.headers.set('X-Cache', 'MISS');
      if (useEtag) response.headers.set('ETag', etag);
      if (options.clientCacheControl) {
        response.headers.set('Cache-Control', options.clientCacheControl);
      }
    }

    return response;
  };
}
