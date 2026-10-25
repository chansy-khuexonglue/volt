import { t, Volt } from '../packages/volt/src/index';

interface BenchResult {
  name: string;
  totalRequests: number;
  durationSec: number;
  rps: number;
  avgLatencyMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
}

async function runBenchmark(
  name: string,
  app: Volt,
  createRequest: (i: number) => Request,
  iterations = 20_000,
  concurrency = 50
): Promise<BenchResult> {
  const latencies: number[] = new Array(iterations);
  let currentIndex = 0;

  const start = performance.now();

  async function worker() {
    while (true) {
      const idx = currentIndex++;
      if (idx >= iterations) break;

      const req = createRequest(idx);
      const reqStart = performance.now();
      const res = await app.handle(req);
      if (res.status >= 400) {
        throw new Error(`Unexpected status ${res.status}`);
      }
      latencies[idx] = performance.now() - reqStart;
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  const totalDurationMs = performance.now() - start;
  const durationSec = totalDurationMs / 1000;
  const rps = Math.round(iterations / durationSec);

  latencies.sort((a, b) => a - b);
  const avgLatencyMs = latencies.reduce((a, b) => a + b, 0) / iterations;
  const p50Ms = latencies[Math.floor(iterations * 0.5)]!;
  const p95Ms = latencies[Math.floor(iterations * 0.95)]!;
  const p99Ms = latencies[Math.floor(iterations * 0.99)]!;

  return {
    name,
    totalRequests: iterations,
    durationSec: Number(durationSec.toFixed(3)),
    rps,
    avgLatencyMs: Number(avgLatencyMs.toFixed(3)),
    p50Ms: Number(p50Ms.toFixed(3)),
    p95Ms: Number(p95Ms.toFixed(3)),
    p99Ms: Number(p99Ms.toFixed(3)),
  };
}

async function main() {
  console.log('===============================================================');
  console.log('⚡ Volt Framework Performance Benchmarks');
  console.log(`Runtime: Bun ${typeof Bun !== 'undefined' ? Bun.version : 'node'}`);
  console.log('===============================================================\n');

  const app = new Volt();

  // 1. Static Route
  app.get('/ping', () => ({ message: 'pong' }));

  // 2. Dynamic Param Route
  app.get('/users/:id', (c) => ({
    id: c.params.id,
    name: `User ${c.params.id}`,
    active: true,
  }));

  // 3. Validated JSON Body Route
  app.post(
    '/items',
    (c) => ({
      success: true,
      data: c.body,
    }),
    {
      body: t.Object({
        title: t.String({ minLength: 2 }),
        price: t.Number({ min: 0 }),
        tags: t.Array(t.String()),
      }),
    }
  );

  const results: BenchResult[] = [];

  // Warmup
  console.log('🔥 Warming up JIT and cache (5,000 requests)...');
  await runBenchmark('Warmup', app, () => new Request('http://localhost/ping'), 5000, 20);

  // Bench 1: Static Route
  console.log('🚀 Running Benchmark 1: Static Route (GET /ping)...');
  results.push(
    await runBenchmark(
      'Static Route (GET /ping)',
      app,
      () => new Request('http://localhost/ping'),
      50_000,
      100
    )
  );

  // Bench 2: Dynamic Route
  console.log('🚀 Running Benchmark 2: Dynamic Route (GET /users/:id)...');
  results.push(
    await runBenchmark(
      'Dynamic Param (GET /users/:id)',
      app,
      (i) => new Request(`http://localhost/users/${i}`),
      50_000,
      100
    )
  );

  // Bench 3: JSON Body & Validation
  console.log('🚀 Running Benchmark 3: Validated JSON POST (/items)...');
  const jsonPayload = JSON.stringify({
    title: 'Volt API Framework',
    price: 99.99,
    tags: ['fast', 'typescript', 'bun'],
  });
  results.push(
    await runBenchmark(
      'Validated JSON (POST /items)',
      app,
      () =>
        new Request('http://localhost/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonPayload,
        }),
      30_000,
      100
    )
  );

  console.log('\n===============================================================');
  console.log('📊 Benchmark Results Summary');
  console.log('===============================================================');
  console.table(results);

  console.log('\n⚡ Benchmark Complete! All requests served successfully with 0 errors.');
}

main().catch(console.error);
