import os from 'node:os';
import { mkdir, writeFile, appendFile } from 'node:fs/promises';
import { join } from 'node:path';
const duration = Number(process.env.BENCH_SECONDS ?? 1);
const repeats = Number(process.env.BENCH_REPEATS ?? 3);
const concurrencies = (process.env.BENCH_CONCURRENCY ?? '10,100').split(',').map(Number);
if (!(duration > 0 && duration <= 30 && Number.isInteger(repeats) && repeats > 0 && repeats <= 10) || concurrencies.some(n => !Number.isInteger(n) || n < 1 || n > 1000)) throw Error('Invalid benchmark settings');
const frameworks = (process.env.BENCH_FRAMEWORKS ?? 'Volt,Elysia,Hono,Bun.serve,Fastify,Express,NestFastify,NestExpress').split(',');
const scenarios = [
  { name: 'static', path: '/ping' },
  { name: 'dynamic', path: '/users/42' },
  { name: 'json-small', path: '/items', body: JSON.stringify({ title: 'Benchmark', price: 10 }) },
  { name: 'json-16k', path: '/items', body: JSON.stringify({ title: 'x'.repeat(16384), price: 10 }) },
];
const output = process.env.BENCH_OUTPUT ?? 'benchmark-results';
await mkdir(output, { recursive: true });
const metadata = { commit: process.env.GITHUB_SHA ?? 'local', runner: process.env.RUNNER_OS ?? 'local', platform: process.platform, arch: process.arch, cpu: os.cpus()[0]?.model, cores: os.cpus().length, memoryBytes: os.totalmem(), bun: Bun.version, timestamp: new Date().toISOString(), duration, repeats, concurrencies, note: 'All servers use Bun, including Node compatibility. Client and server are separate processes on the same runner. POST schema validation is enabled for Volt, Elysia and Fastify; others parse JSON only. No database work.' };
const results: Array<{ framework: string; scenario: string; concurrency: number; repeat: number; rps: number; p50: number; p95: number; p99: number; requests: number; errors: number }> = [];
for (let repeat = 0; repeat < repeats; repeat++) {
  const order = [...frameworks.slice(repeat % frameworks.length), ...frameworks.slice(0, repeat % frameworks.length)];
  for (const framework of order) {
    const child = Bun.spawn([process.execPath, join(import.meta.dir, 'worker.ts'), framework], { stdout: 'pipe', stderr: 'inherit' });
    try {
      const reader = child.stdout.getReader();
      let ready = '';
      while (!ready.includes('BENCHMARK_READY')) {
        const part = await reader.read();
        if (part.done) throw Error(`${framework} failed to start`);
        ready += new TextDecoder().decode(part.value);
      }
      reader.releaseLock();
      for (const concurrency of concurrencies) for (const scenario of scenarios) {
        const options: RequestInit = scenario.body ? { method: 'POST', headers: {'content-type': 'application/json'}, body: scenario.body } : {};
        const url = `http://127.0.0.1:4011${scenario.path}`;
        const check = await fetch(url, options);
        const payload = await check.json() as any;
        if (check.status >= 400 || (scenario.body ? payload.data?.title !== JSON.parse(scenario.body).title : scenario.name === 'static' ? payload.message !== 'pong' : payload.id !== '42')) throw Error(`${framework}/${scenario.name}: response contract failed`);
        async function measure(seconds: number) {
          const times: number[] = []; let errors = 0;
          const begin = performance.now(), end = begin + seconds * 1000;
          await Promise.all(Array.from({length: concurrency}, async () => {
            while (performance.now() < end) {
              const start = performance.now();
              try { const response = await fetch(url, options); await response.arrayBuffer(); if (response.status >= 400) errors++; }
              catch { errors++; }
              times.push(performance.now() - start);
            }
          }));
          const elapsed = (performance.now() - begin) / 1000;
          times.sort((a,b) => a-b);
          const percentile = (p:number) => times[Math.min(times.length - 1, Math.floor(times.length*p))] ?? 0;
          return {rps: Math.round((times.length-errors)/elapsed), requests:times.length, errors, p50:percentile(.5),p95:percentile(.95),p99:percentile(.99)};
        }
        await measure(.2);
        const result = {framework, scenario:scenario.name,concurrency,repeat:repeat+1,...await measure(duration)};
        results.push(result);
        console.log(JSON.stringify(result));
      }
    } finally { child.kill(); await child.exited; }
    await writeFile(join(output,'results.json'), JSON.stringify({metadata,results},null,2));
  }
}
const rows = ['| Framework | Scenario | Concurrency | Median req/s | Min–max req/s | Median P99 ms | Errors |','|---|---|---:|---:|---:|---:|---:|'];
const median = (values:number[]) => { const a=values.toSorted((x,y)=>x-y); return a[Math.floor(a.length/2)]!; };
for (const framework of frameworks) for (const scenario of scenarios) for (const concurrency of concurrencies) {
 const runs=results.filter(r=>r.framework===framework&&r.scenario===scenario.name&&r.concurrency===concurrency);
 rows.push(`| ${framework} | ${scenario.name} | ${concurrency} | ${median(runs.map(r=>r.rps))} | ${Math.min(...runs.map(r=>r.rps))}–${Math.max(...runs.map(r=>r.rps))} | ${median(runs.map(r=>r.p99)).toFixed(3)} | ${runs.reduce((s,r)=>s+r.errors,0)} |`);
}
const summary=`# ${metadata.runner} ${metadata.arch} · Bun ${Bun.version}\n\nCPU: ${metadata.cpu}; logical CPUs: ${metadata.cores}. ${metadata.note}\n\n${rows.join('\n')}\n`;
await writeFile(join(output,'summary.md'),summary);
if(process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
if(results.some(r=>r.errors>0)) throw Error('HTTP errors observed; inspect results before comparing');
