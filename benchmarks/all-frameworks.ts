import { createVoltServer } from './servers/volt';
import { createElysiaServer } from './servers/elysia';
import { createHonoServer } from './servers/hono';
import { createBunServeServer } from './servers/bun-serve';
import { createFastifyServer } from './servers/fastify';
import { createExpressServer } from './servers/express';
import { createNestFastifyServer } from './servers/nest-fastify';
import { createNestExpressServer } from './servers/nest-express';

interface BenchmarkResult {
  framework: string;
  runtime: string;
  scenario: string;
  rps: number;
  avgLatencyMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
}

async function benchmarkEndpoint(
  framework: string,
  runtime: string,
  scenario: string,
  url: string,
  options: RequestInit = {},
  iterations = 10_000,
  concurrency = 40
): Promise<BenchmarkResult> {
  const latencies: number[] = new Array(iterations);
  let currentIndex = 0;

  // Warmup 500 requests
  for (let i = 0; i < 500; i++) {
    await fetch(url, options);
  }

  const start = performance.now();

  async function worker() {
    while (true) {
      const idx = currentIndex++;
      if (idx >= iterations) break;

      const targetUrl = url.includes(':id') ? url.replace(':id', String(idx % 1000)) : url;
      const reqStart = performance.now();
      const res = await fetch(targetUrl, options);
      if (res.status >= 400) {
        throw new Error(`[${framework}] Unexpected HTTP ${res.status} from ${targetUrl}`);
      }
      await res.arrayBuffer(); // Consume full response
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
    runtime,
    scenario,
    rps,
    avgLatencyMs: Number(avgLatencyMs.toFixed(3)),
    p50Ms: Number(p50Ms.toFixed(3)),
    p95Ms: Number(p95Ms.toFixed(3)),
    p99Ms: Number(p99Ms.toFixed(3)),
  };
}

async function main() {
  console.log('========================================================================');
  console.log('⚡ 8-Framework Comprehensive Performance Benchmark');
  console.log(`Runtime: Bun ${typeof Bun !== 'undefined' ? Bun.version : process.version}`);
  console.log('========================================================================\n');

  console.log('🚀 Booting all 8 framework benchmark servers...');

  // 1. Volt
  const voltApp = createVoltServer(4011);
  const voltServer = voltApp.listen(4011);
  console.log('  ✓ Volt listening on port 4011');

  // 2. Elysia
  const elysiaApp = createElysiaServer(4012);
  const elysiaServer = elysiaApp.listen(4012);
  console.log('  ✓ Elysia listening on port 4012');

  // 3. Hono
  const honoApp = createHonoServer(4013);
  const honoServer = Bun.serve({ port: 4013, fetch: honoApp.fetch });
  console.log('  ✓ Hono listening on port 4013');

  // 4. Bun.serve
  const bunServer = createBunServeServer(4014);
  console.log('  ✓ Bun.serve listening on port 4014');

  // 5. Fastify
  const fastifyApp = await createFastifyServer(4015);
  console.log('  ✓ Fastify listening on port 4015');

  // 6. Express
  const { server: expressServer } = await createExpressServer(4016);
  console.log('  ✓ Express listening on port 4016');

  // 7. NestJS + Fastify
  const nestFastifyApp = await createNestFastifyServer(4017);
  console.log('  ✓ NestJS + Fastify listening on port 4017');

  // 8. NestJS + Express
  const nestExpressApp = await createNestExpressServer(4018);
  console.log('  ✓ NestJS + Express listening on port 4018');

  console.log('\n🔥 All servers ready. Running test suite across 3 scenarios...\n');

  const targets = [
    { name: '⚡ Volt', runtime: `Bun ${Bun.version}`, port: 4011 },
    { name: 'Elysia', runtime: `Bun ${Bun.version}`, port: 4012 },
    { name: 'Hono', runtime: `Bun ${Bun.version}`, port: 4013 },
    { name: 'Bun.serve', runtime: `Bun ${Bun.version}`, port: 4014 },
    { name: 'Fastify', runtime: `Node Compat (Bun)`, port: 4015 },
    { name: 'Express', runtime: `Node Compat (Bun)`, port: 4016 },
    { name: 'NestJS + Fastify', runtime: `Node Compat (Bun)`, port: 4017 },
    { name: 'NestJS + Express', runtime: `Node Compat (Bun)`, port: 4018 },
  ];

  const results: BenchmarkResult[] = [];

  const postPayload = JSON.stringify({ title: 'Volt Benchmark', price: 99.99 });
  const postHeaders = { 'Content-Type': 'application/json' };

  for (const t of targets) {
    console.log(`⏱️  Benchmarking ${t.name}...`);

    // Scenario 1: Static Route
    const resStatic = await benchmarkEndpoint(
      t.name,
      t.runtime,
      'Static GET (/ping)',
      `http://127.0.0.1:${t.port}/ping`,
      { method: 'GET' },
      8_000,
      30
    );
    results.push(resStatic);

    // Scenario 2: Dynamic Route
    const resDynamic = await benchmarkEndpoint(
      t.name,
      t.runtime,
      'Dynamic Param (/users/:id)',
      `http://127.0.0.1:${t.port}/users/:id`,
      { method: 'GET' },
      8_000,
      30
    );
    results.push(resDynamic);

    // Scenario 3: Validated / JSON POST
    const resPost = await benchmarkEndpoint(
      t.name,
      t.runtime,
      'JSON Body (POST /items)',
      `http://127.0.0.1:${t.port}/items`,
      { method: 'POST', headers: postHeaders, body: postPayload },
      6_000,
      30
    );
    results.push(resPost);
  }

  // Graceful shutdown
  console.log('\n🛑 Shutting down benchmark servers...');
  voltServer?.stop?.();
  elysiaServer?.stop?.();
  honoServer?.stop?.();
  bunServer?.stop?.();
  await fastifyApp.close();
  expressServer.close();
  await nestFastifyApp.close();
  await nestExpressApp.close();

  console.log('\n========================================================================');
  console.log('📊 Comprehensive Multi-Framework Benchmark Results');
  console.log('========================================================================\n');
  console.table(results);
}

main().catch((err) => {
  console.error('Benchmark error:', err);
  process.exit(1);
});
