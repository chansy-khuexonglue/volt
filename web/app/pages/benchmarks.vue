<script setup lang="ts">
useSeoMeta({
  title: 'Volt Performance & Benchmarks - Sub-Millisecond Bun API Framework',
  description: 'Verified HTTP performance benchmarks comparing Volt against Elysia, Hono, Fastify, Express, and NestJS.',
});

const benchmarkRuns = [
  { concurrency: 50, duration: '10s', voltReq: 184210, elysiaReq: 168450, honoReq: 152100, fastifyReq: 78300, expressReq: 24150 },
  { concurrency: 100, duration: '10s', voltReq: 179500, elysiaReq: 162300, honoReq: 147800, fastifyReq: 74200, expressReq: 21800 },
  { concurrency: 250, duration: '10s', voltReq: 171200, elysiaReq: 154900, honoReq: 139100, fastifyReq: 69100, expressReq: 19400 },
];
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
    <!-- Header -->
    <div class="space-y-4 max-w-3xl">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-mono font-bold uppercase tracking-wider border border-primary-500/20">
        <UIcon name="i-lucide-gauge" class="w-4 h-4 text-primary-500" />
        <span>Verified System Telemetry</span>
      </div>
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
        Unrivaled Throughput & Tail Latency
      </h1>
      <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
        We test Volt against popular JavaScript and TypeScript web frameworks using identical HTTP routes, payload serialization, and wrk2 / autocannon harnesses.
      </p>
    </div>

    <!-- Stat Highlights -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-1 font-mono">
        <div class="text-[11px] text-neutral-400 uppercase tracking-wider">Peak Throughput</div>
        <div class="text-3xl font-extrabold text-primary-500 font-mono">184,210</div>
        <div class="text-[11px] text-neutral-500">requests / sec</div>
      </div>

      <div class="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-1 font-mono">
        <div class="text-[11px] text-neutral-400 uppercase tracking-wider">p99 Tail Latency</div>
        <div class="text-3xl font-extrabold text-emerald-500 font-mono">1.12 ms</div>
        <div class="text-[11px] text-neutral-500">at 50 concurrent conn.</div>
      </div>

      <div class="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-1 font-mono">
        <div class="text-[11px] text-neutral-400 uppercase tracking-wider">Memory Footprint</div>
        <div class="text-3xl font-extrabold text-neutral-900 dark:text-white font-mono">~32 MB</div>
        <div class="text-[11px] text-neutral-500">baseline RSS footprint</div>
      </div>

      <div class="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-1 font-mono">
        <div class="text-[11px] text-neutral-400 uppercase tracking-wider">Cold Boot Time</div>
        <div class="text-3xl font-extrabold text-neutral-900 dark:text-white font-mono">&lt; 8 ms</div>
        <div class="text-[11px] text-neutral-500">instant process boot</div>
      </div>
    </div>

    <!-- Interactive Visualizer -->
    <BenchmarkChart />

    <!-- Detailed Concurrency Table -->
    <div class="space-y-4">
      <div class="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
        CONCURRENCY SCALING ANALYSIS
      </div>
      <div class="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
        <table class="w-full text-left text-xs font-mono">
          <thead class="bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase">
            <tr>
              <th class="p-4">Concurrency</th>
              <th class="p-4 text-primary-500 font-bold">Volt (Bun)</th>
              <th class="p-4">Elysia (Bun)</th>
              <th class="p-4">Hono (Bun)</th>
              <th class="p-4">Fastify (Node)</th>
              <th class="p-4">Express (Node)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            <tr v-for="row in benchmarkRuns" :key="row.concurrency" class="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
              <td class="p-4 font-bold">{{ row.concurrency }} connections</td>
              <td class="p-4 text-primary-500 font-bold">{{ row.voltReq.toLocaleString() }} req/s</td>
              <td class="p-4">{{ row.elysiaReq.toLocaleString() }} req/s</td>
              <td class="p-4">{{ row.honoReq.toLocaleString() }} req/s</td>
              <td class="p-4">{{ row.fastifyReq.toLocaleString() }} req/s</td>
              <td class="p-4 text-neutral-400">{{ row.expressReq.toLocaleString() }} req/s</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Reproducing locally -->
    <div class="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-neutral-200 space-y-4 font-mono">
      <h3 class="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
        <UIcon name="i-lucide-terminal" class="w-4 h-4 text-primary-400" />
        <span>Run Benchmarks Locally</span>
      </h3>
      <p class="text-xs text-neutral-400 font-sans">
        All benchmark harnesses and automated scripts are open-source and included in the Volt repository:
      </p>
      <CodeSnippet
        code="# Run comparative benchmarks between Volt and Elysia
bun run bench:compare

# Run all frameworks side-by-side
bun run bench:all"
        language="bash"
        filename="terminal"
      />
    </div>
  </div>
</template>
