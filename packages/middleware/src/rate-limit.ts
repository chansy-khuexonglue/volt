import { MiddlewareHandler, RateLimitOptions } from './types';

export function rateLimit(options: RateLimitOptions = {}): MiddlewareHandler {
  const windowMs = options.windowMs || 60_000;
  const max = options.max || 100;
  const message = options.message || 'Too many requests, please try again later.';
  const statusCode = options.statusCode || 429;

  const keyGen = options.keyGenerator || ((ctx: any) => {
    return (
      ctx.req.headers.get('x-forwarded-for') ||
      ctx.req.headers.get('cf-connecting-ip') ||
      'anonymous'
    );
  });

  const hits = new Map<string, { count: number; resetTime: number }>();

  // Cleanup expired items periodically
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, data] of hits.entries()) {
      if (now > data.resetTime) {
        hits.delete(key);
      }
    }
  }, windowMs);
  (timer as any)?.unref?.();

  return async (ctx: any, next) => {
    const key = keyGen(ctx);
    const now = Date.now();
    let record = hits.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      hits.set(key, record);
    } else {
      record.count++;
    }

    const remaining = Math.max(0, max - record.count);
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);

    if (record.count > max) {
      return new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message,
          retryAfter,
        }),
        {
          status: statusCode,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(max),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(record.resetTime / 1000)),
          },
        }
      );
    }

    const res = await next();
    const response = res instanceof Response ? res : new Response(null, { status: 204 });

    response.headers.set('X-RateLimit-Limit', String(max));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));

    return response;
  };
}
