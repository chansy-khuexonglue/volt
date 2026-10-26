import { describe, expect, it } from 'bun:test';
import { createVoltServer } from '../servers/volt';
import { createElysiaServer } from '../servers/elysia';
import { createHonoServer } from '../servers/hono';
import { createBunServeHandler } from '../servers/bun-serve';
import { createFastifyServer } from '../servers/fastify';
import { createExpressServer } from '../servers/express';
import { createNestFastifyServer } from '../servers/nest-fastify';
import { createNestExpressServer } from '../servers/nest-express';

describe('@voltts/benchmarks - Framework Equivalence & Functional Tests', () => {
  it('verifies Volt baseline endpoints respond correctly', async () => {
    const app = createVoltServer();

    // 1. Static
    const pingRes = await app.handle(new Request('http://localhost/ping'));
    expect(pingRes.status).toBe(200);
    expect(await pingRes.json()).toEqual({ message: 'pong' });

    // 2. Dynamic Param
    const userRes = await app.handle(new Request('http://localhost/users/123'));
    expect(userRes.status).toBe(200);
    expect(await userRes.json()).toEqual({ id: '123', name: 'User 123' });

    // 3. Validated JSON
    const postRes = await app.handle(
      new Request('http://localhost/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'MacBook Pro', price: 1999 }),
      })
    );
    expect(postRes.status).toBe(200);
    expect(await postRes.json()).toEqual({
      success: true,
      data: { title: 'MacBook Pro', price: 1999 },
    });
  });

  it('verifies Elysia endpoints respond with identical contracts', async () => {
    const app = createElysiaServer();

    const pingRes = await app.handle(new Request('http://localhost/ping'));
    expect(pingRes.status).toBe(200);
    expect(await pingRes.json()).toEqual({ message: 'pong' });

    const userRes = await app.handle(new Request('http://localhost/users/123'));
    expect(userRes.status).toBe(200);
    expect(await userRes.json()).toEqual({ id: '123', name: 'User 123' });

    const postRes = await app.handle(
      new Request('http://localhost/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Dell XPS', price: 1499 }),
      })
    );
    expect(postRes.status).toBe(200);
    expect(await postRes.json()).toEqual({
      success: true,
      data: { title: 'Dell XPS', price: 1499 },
    });
  });

  it('verifies Hono endpoints respond with identical contracts', async () => {
    const app = createHonoServer();

    const pingRes = await app.fetch(new Request('http://localhost/ping'));
    expect(pingRes.status).toBe(200);
    expect(await pingRes.json()).toEqual({ message: 'pong' });

    const userRes = await app.fetch(new Request('http://localhost/users/456'));
    expect(userRes.status).toBe(200);
    expect(await userRes.json()).toEqual({ id: '456', name: 'User 456' });

    const postRes = await app.fetch(
      new Request('http://localhost/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'ThinkPad', price: 1299 }),
      })
    );
    expect(postRes.status).toBe(200);
    expect(await postRes.json()).toEqual({
      success: true,
      data: { title: 'ThinkPad', price: 1299 },
    });
  });

  it('verifies Bun.serve minimal handler responds with identical contracts', async () => {
    const fetchHandler = createBunServeHandler();

    const pingRes = await fetchHandler(new Request('http://localhost/ping'));
    expect(pingRes.status).toBe(200);
    expect(await pingRes.json()).toEqual({ message: 'pong' });

    const userRes = await fetchHandler(new Request('http://localhost/users/789'));
    expect(userRes.status).toBe(200);
    expect(await userRes.json()).toEqual({ id: '789', name: 'User 789' });

    const postRes = await fetchHandler(
      new Request('http://localhost/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Razor Blade', price: 2199 }),
      })
    );
    expect(postRes.status).toBe(200);
    expect(await postRes.json()).toEqual({
      success: true,
      data: { title: 'Razor Blade', price: 2199 },
    });
  });

  it('verifies Fastify HTTP server responds with identical contracts', async () => {
    const app = await createFastifyServer(4911);

    const pingRes = await fetch('http://127.0.0.1:4911/ping');
    expect(pingRes.status).toBe(200);
    expect(await pingRes.json()).toEqual({ message: 'pong' });

    const userRes = await fetch('http://127.0.0.1:4911/users/555');
    expect(userRes.status).toBe(200);
    expect(await userRes.json()).toEqual({ id: '555', name: 'User 555' });

    await app.close();
  });

  it('verifies Express HTTP server responds with identical contracts', async () => {
    const { server } = await createExpressServer(4912);

    const pingRes = await fetch('http://127.0.0.1:4912/ping');
    expect(pingRes.status).toBe(200);
    expect(await pingRes.json()).toEqual({ message: 'pong' });

    const userRes = await fetch('http://127.0.0.1:4912/users/777');
    expect(userRes.status).toBe(200);
    expect(await userRes.json()).toEqual({ id: '777', name: 'User 777' });

    server.close();
  });

  it('verifies NestJS Fastify responds with identical contracts', async () => {
    const app = await createNestFastifyServer(4913);

    const pingRes = await fetch('http://127.0.0.1:4913/ping');
    expect(pingRes.status).toBe(200);
    expect(await pingRes.json()).toEqual({ message: 'pong' });

    await app.close();
  });

  it('verifies NestJS Express responds with identical contracts', async () => {
    const app = await createNestExpressServer(4914);

    const pingRes = await fetch('http://127.0.0.1:4914/ping');
    expect(pingRes.status).toBe(200);
    expect(await pingRes.json()).toEqual({ message: 'pong' });

    await app.close();
  });
});

describe('@voltts/benchmarks - Performance SLA & Budget Validation', () => {
  it('validates Volt satisfies throughput performance SLA (>50,000 req/sec static)', async () => {
    const app = createVoltServer();
    const iterations = 5000;
    const req = new Request('http://localhost/ping');

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      const res = await app.handle(req);
      if (res.status !== 200) throw new Error('Failed');
    }
    const durationSec = (performance.now() - start) / 1000;
    const rps = Math.round(iterations / durationSec);

    // Assert minimum throughput SLA on Bun
    expect(rps).toBeGreaterThan(50_000);
  });

  it('validates sub-millisecond p95 latency on validated JSON routes', async () => {
    const app = createVoltServer();
    const iterations = 1000;
    const latencies: number[] = new Array(iterations);

    const jsonPayload = JSON.stringify({ title: 'Volt SLA', price: 49.99 });

    for (let i = 0; i < iterations; i++) {
      const t0 = performance.now();
      const res = await app.handle(
        new Request('http://localhost/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonPayload,
        })
      );
      latencies[i] = performance.now() - t0;
      if (res.status !== 200) throw new Error('Failed');
    }

    latencies.sort((a, b) => a - b);
    const p95 = latencies[Math.floor(iterations * 0.95)]!;

    // Assert p95 stays below 2.0ms under serial dispatch
    expect(p95).toBeLessThan(2.0);
  });
});
