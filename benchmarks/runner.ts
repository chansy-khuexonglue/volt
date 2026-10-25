import { createVoltBenchmarkServer } from './volt/server';

interface BenchmarkMetrics {
  framework: string;
  scenario: string;
  rps: number;
  avgLatencyMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
}

async function measureHandler(
  framework: string,
  scenario: string,
  handler: (req: Request) => Promise<Response> | Response,
  createReq: (i: number) => Request,
  iterations = 25_000,
  concurrency = 50
): Promise<BenchmarkMetrics> {
  const latencies: number[] = new Array(iterations);
  let currentIndex = 0;

  const start = performance.now();

  async function worker() {
    while (true) {
      const idx = currentIndex++;
      if (idx >= iterations) break;

      const req = createReq(idx);
      const reqStart = performance.now();
      const res = await handler(req);
      if (res.status >= 400) {
        throw new Error(`Unexpected status ${res.status}`);
      }
      latencies[idx] = performance.now() - reqStart;
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  const totalDurationMs = performance.now() - start;
  const durationSec = totalDurationMs / 1000;
  const rps = Math.round(iterations / durationSec);

  latencies.sort((a, b) => a - b);
  const avgLatencyMs = latencies.reduce((a, b) => a + b, 0) / iterations;
  const p50Ms = latencies[Math.floor(iterations * 0.5)]!;
  const p95Ms = latencies[Math.floor(iterations * 0.95)]!;
  const p99Ms = latencies[Math.floor(iterations * 0.99)]!;

  return {
    framework,
    scenario,
    rps,
    avgLatencyMs: Number(avgLatencyMs.toFixed(3)),
    p50Ms: Number(p50Ms.toFixed(3)),
    p95Ms: Number(p95Ms.toFixed(3)),
    p99Ms: Number(p99Ms.toFixed(3)),
  };
}

async function main() {
  console.log('===============================================================');
  console.log('⚡ Volt vs Multi-Framework Comparison Benchmark Suite');
  // @ts-ignore
  console.log(`Runtime: Bun ${typeof Bun !== 'undefined' ? Bun.version : process.version}`);
  console.log('===============================================================\n');

  const voltApp = createVoltBenchmarkServer(4001);
  const results: BenchmarkMetrics[] = [];

  // Scenarios on Volt
  console.log('🚀 Benchmarking Volt: Static Route (GET /ping)...');
  results.push(
    await measureHandler(
      '⚡ Volt',
      'Static GET (/ping)',
      (r) => voltApp.handle(r),
      () => new Request('http://localhost:4001/ping')
    )
  );

  console.log('🚀 Benchmarking Volt: Dynamic Param (GET /users/:id)...');
  results.push(
    await measureHandler(
      '⚡ Volt',
      'Dynamic Param (/users/:id)',
      (r) => voltApp.handle(r),
      (i) => new Request(`http://localhost:4001/users/${i}`)
    )
  );

  console.log('🚀 Benchmarking Volt: Validated JSON POST (/items)...');
  const payloadStr = JSON.stringify({ title: 'Gaming Laptop', price: 1499 });
  results.push(
    await measureHandler(
      '⚡ Volt',
      'Validated JSON (POST /items)',
      (r) => voltApp.handle(r),
      () =>
        new Request('http://localhost:4001/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payloadStr,
        })
    )
  );

  console.log('\n===============================================================');
  console.log('📊 Benchmark Results');
  console.log('===============================================================');
  console.table(results);
}

if (import.meta.main) {
  main();
}
