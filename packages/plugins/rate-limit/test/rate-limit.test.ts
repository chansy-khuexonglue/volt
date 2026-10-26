import { describe, expect, it } from 'bun:test';
import { Volt } from '@voltts/core';
import { rateLimitPlugin } from '../src/index';

describe('@voltts/plugin-rate-limit', () => {
  it('allows requests within rate limit and attaches headers', async () => {
    const app = new Volt();
    app.plugin(rateLimitPlugin({ max: 3, windowMs: 10_000 }));

    app.get('/ping', (c) => c.json({ pong: true }));

    const res1 = await app.handle(new Request('http://localhost/ping'));
    expect(res1.status).toBe(200);
    expect(res1.headers.get('X-RateLimit-Limit')).toBe('3');
    expect(res1.headers.get('X-RateLimit-Remaining')).toBe('2');
    expect(res1.headers.get('RateLimit-Remaining')).toBe('2');

    const res2 = await app.handle(new Request('http://localhost/ping'));
    expect(res2.status).toBe(200);
    expect(res2.headers.get('X-RateLimit-Remaining')).toBe('1');
  });

  it('blocks requests exceeding limit with 429 and Retry-After', async () => {
    const app = new Volt();
    app.plugin(
      rateLimitPlugin({
        max: 2,
        windowMs: 5_000,
        message: 'Calm down!',
      })
    );

    app.get('/limited', (c) => c.text('ok'));

    await app.handle(new Request('http://localhost/limited'));
    await app.handle(new Request('http://localhost/limited'));

    // 3rd request should exceed limit
    const res3 = await app.handle(new Request('http://localhost/limited'));
    expect(res3.status).toBe(429);
    expect(res3.headers.get('Retry-After')).toBeDefined();
    expect(res3.headers.get('X-RateLimit-Remaining')).toBe('0');

    const body = await res3.json();
    expect(body.error).toBe('Too Many Requests');
    expect(body.message).toBe('Calm down!');
  });

  it('skips rate limiting when skip function returns true', async () => {
    const app = new Volt();
    app.plugin(
      rateLimitPlugin({
        max: 1,
        windowMs: 5_000,
        skip: (c) => c.path === '/health',
      })
    );

    app.get('/health', (c) => c.json({ status: 'ok' }));

    const res1 = await app.handle(new Request('http://localhost/health'));
    const res2 = await app.handle(new Request('http://localhost/health'));
    const res3 = await app.handle(new Request('http://localhost/health'));

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res3.status).toBe(200);
  });

  it('differentiates clients using keyGenerator', async () => {
    const app = new Volt();
    app.plugin(
      rateLimitPlugin({
        max: 1,
        windowMs: 5_000,
      })
    );

    app.get('/test', (c) => c.text('hello'));

    const resA1 = await app.handle(
      new Request('http://localhost/test', { headers: { 'x-forwarded-for': '1.1.1.1' } })
    );
    expect(resA1.status).toBe(200);

    const resA2 = await app.handle(
      new Request('http://localhost/test', { headers: { 'x-forwarded-for': '1.1.1.1' } })
    );
    expect(resA2.status).toBe(429);

    // Client B from 2.2.2.2 should succeed
    const resB1 = await app.handle(
      new Request('http://localhost/test', { headers: { 'x-forwarded-for': '2.2.2.2' } })
    );
    expect(resB1.status).toBe(200);
  });
});
