import { Volt, VoltPlugin, VoltContext } from '@volt/core';
import { MemoryRateLimitStore } from './store';
import { RateLimitPluginOptions } from './types';

export * from './types';
export * from './store';

export function rateLimitPlugin(options: RateLimitPluginOptions = {}): VoltPlugin {
  const windowMs = options.windowMs || 60_000;
  const max = options.max || 100;
  const statusCode = options.statusCode || 429;
  const standardHeaders = options.standardHeaders !== false;
  const legacyHeaders = options.legacyHeaders !== false;
  const store = options.store || new MemoryRateLimitStore(windowMs);

  const defaultKeyGen = (ctx: VoltContext): string => {
    return (
      ctx.req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      ctx.req.headers.get('cf-connecting-ip') ||
      '127.0.0.1'
    );
  };

  const keyGen = options.keyGenerator || defaultKeyGen;

  return {
    name: '@volt/plugin-rate-limit',
    version: '0.1.0',
    setup(app: Volt) {
      app.use(async (ctx: VoltContext, next) => {
        if (options.skip && (await options.skip(ctx))) {
          return next();
        }

        const key = await keyGen(ctx);
        const record = await store.increment(key, windowMs);
        const now = Date.now();
        const remaining = Math.max(0, max - record.count);
        const resetSeconds = Math.ceil(record.resetTime / 1000);
        const retryAfter = Math.max(1, Math.ceil((record.resetTime - now) / 1000));

        if (record.count > max) {
          const body = typeof options.message === 'object'
            ? options.message
            : {
                error: 'Too Many Requests',
                message: options.message || `Rate limit exceeded, retry in ${retryAfter} seconds.`,
                retryAfter,
              };

          const headers = new Headers({
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
          });

          if (legacyHeaders) {
            headers.set('X-RateLimit-Limit', String(max));
            headers.set('X-RateLimit-Remaining', '0');
            headers.set('X-RateLimit-Reset', String(resetSeconds));
          }

          if (standardHeaders) {
            headers.set('RateLimit-Limit', String(max));
            headers.set('RateLimit-Remaining', '0');
            headers.set('RateLimit-Reset', String(retryAfter));
          }

          return new Response(JSON.stringify(body), {
            status: statusCode,
            headers,
          });
        }

        const res = await next();
        const response = res instanceof Response ? res : new Response(null, { status: 204 });

        if (legacyHeaders) {
          response.headers.set('X-RateLimit-Limit', String(max));
          response.headers.set('X-RateLimit-Remaining', String(remaining));
          response.headers.set('X-RateLimit-Reset', String(resetSeconds));
        }

        if (standardHeaders) {
          response.headers.set('RateLimit-Limit', String(max));
          response.headers.set('RateLimit-Remaining', String(remaining));
          response.headers.set('RateLimit-Reset', String(retryAfter));
        }

        return response;
      });
    },
    async cleanup() {
      if (store.close) {
        await store.close();
      }
    },
  };
}

export default rateLimitPlugin;
