import { describe, expect, it } from 'bun:test';
import { compose, cors, rateLimit, secureHeaders, timeout } from '../src/index';

describe('@volt/middleware', () => {
  it('executes middleware in deterministic order', async () => {
    const order: number[] = [];

    const m1 = async (_ctx: any, next: any) => {
      order.push(1);
      await next();
      order.push(4);
    };

    const m2 = async (_ctx: any, next: any) => {
      order.push(2);
      await next();
      order.push(3);
    };

    const pipeline = compose([m1, m2]);
    await pipeline({}, () => {
      return new Response('ok');
    });

    expect(order).toEqual([1, 2, 3, 4]);
  });

  it('allows middleware to short-circuit pipeline', async () => {
    const mAuth = (_ctx: any, _next: any) => {
      return new Response('Unauthorized', { status: 401 });
    };

    const mNext = (_ctx: any, next: any) => next();

    const pipeline = compose([mAuth, mNext]);
    const res = await pipeline({}, () => new Response('ok'));

    expect(res.status).toBe(401);
  });

  it('handles CORS and preflight OPTIONS', async () => {
    const corsMiddleware = cors({
      origin: 'https://example.com',
      credentials: true,
    });

    // 1. Normal GET request
    const ctxGet = {
      req: new Request('http://localhost/test', {
        method: 'GET',
        headers: { origin: 'https://example.com' },
      }),
    };
    const resGet = await corsMiddleware(ctxGet, () => new Response('data'));
    expect((resGet as Response).headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
    expect((resGet as Response).headers.get('Access-Control-Allow-Credentials')).toBe('true');

    // 2. Preflight OPTIONS
    const ctxOptions = {
      req: new Request('http://localhost/test', {
        method: 'OPTIONS',
        headers: { origin: 'https://example.com' },
      }),
    };
    const resOptions = await corsMiddleware(ctxOptions, () => new Response('data'));
    expect((resOptions as Response).status).toBe(204);
    expect((resOptions as Response).headers.get('Access-Control-Allow-Methods')).toContain('GET');
  });

  it('enforces rate limits', async () => {
    const limiter = rateLimit({
      windowMs: 10_000,
      max: 2,
      keyGenerator: () => 'test-client',
    });

    const ctx = {
      req: new Request('http://localhost/api'),
    };

    const r1 = await limiter(ctx, () => new Response('ok'));
    expect((r1 as Response).status).toBe(200);

    const r2 = await limiter(ctx, () => new Response('ok'));
    expect((r2 as Response).status).toBe(200);

    // 3rd hit exceeds max: 2
    const r3 = await limiter(ctx, () => new Response('ok'));
    expect((r3 as Response).status).toBe(429);
  });

  it('attaches secure headers', async () => {
    const sec = secureHeaders();
    const ctx = { req: new Request('http://localhost/') };
    const res = (await sec(ctx, () => new Response('content'))) as Response;

    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('Strict-Transport-Security')).toBeDefined();
  });

  it('handles request timeouts', async () => {
    const t = timeout(50);
    const ctx = { req: new Request('http://localhost/slow') };

    const slowHandler = () => new Promise<Response>((resolve) => {
      setTimeout(() => resolve(new Response('done')), 150);
    });

    const res = await t(ctx, slowHandler);
    expect((res as Response).status).toBe(504);
  });
});
