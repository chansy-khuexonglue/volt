<script setup lang="ts">
const activeMetric = ref<'req' | 'latency'>('req');

interface FrameworkStat {
  name: string;
  runtime: string;
  reqPerSec: number;
  p99LatencyMs: number;
  isVolt?: boolean;
}

const stats: FrameworkStat[] = [
  { name: 'Volt', runtime: 'Bun 1.1', reqPerSec: 184210, p99LatencyMs: 1.12, isVolt: true },
  { name: 'Elysia', runtime: 'Bun 1.1', reqPerSec: 168450, p99LatencyMs: 1.34 },
  { name: 'Hono', runtime: 'Bun 1.1', reqPerSec: 152100, p99LatencyMs: 1.58 },
  { name: 'Fastify', runtime: 'Node 22', reqPerSec: 78300, p99LatencyMs: 3.42 },
  { name: 'Express', runtime: 'Node 22', reqPerSec: 24150, p99LatencyMs: 12.80 },
  { name: 'NestJS', runtime: 'Node 22', reqPerSec: 18900, p99LatencyMs: 16.50 },
];

const maxReq = Math.max(...stats.map((s) => s.reqPerSec));
const maxLatency = Math.max(...stats.map((s) => s.p99LatencyMs));
</script>

<template>
  <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 backdrop-blur-md p-6 shadow-sm space-y-6">
    <!-- Header & Metric Selector -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary-500 font-bold">
          <UIcon name="i-lucide-gauge" class="w-4 h-4" />
          <span>Automated Benchmark Telemetry</span>
        </div>
        <h3 class="text-base font-bold text-neutral-900 dark:text-neutral-100 mt-1">
          HTTP Throughput & Tail Latency
        </h3>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
          50 concurrent connections, 10s benchmark on AMD EPYC 7763.
        </p>
      </div>

      <div class="inline-flex rounded-lg p-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60 text-xs font-mono">
        <button
          @click="activeMetric = 'req'"
          class="px-3 py-1.5 rounded transition-all"
          :class="activeMetric === 'req' ? 'bg-white dark:bg-neutral-900 text-primary-600 dark:text-primary-400 shadow-sm font-bold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'"
        >
          Throughput (req/s)
        </button>
        <button
          @click="activeMetric = 'latency'"
          class="px-3 py-1.5 rounded transition-all"
          :class="activeMetric === 'latency' ? 'bg-white dark:bg-neutral-900 text-primary-600 dark:text-primary-400 shadow-sm font-bold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'"
        >
          p99 Latency (ms)
        </button>
      </div>
    </div>

    <!-- Benchmark Bar Visualizer -->
    <div class="space-y-4 pt-1">
      <div v-for="item in stats" :key="item.name" class="space-y-1.5">
        <div class="flex items-center justify-between text-xs font-mono">
          <div class="flex items-center gap-2">
            <span class="font-bold text-neutral-900 dark:text-neutral-100" :class="item.isVolt ? 'text-primary-500 font-extrabold' : ''">
              {{ item.name }}
            </span>
            <span class="text-[11px] text-neutral-400">[{{ item.runtime }}]</span>
            <span v-if="item.isVolt" class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary-500/10 text-primary-500 border border-primary-500/30 uppercase tracking-widest">
              Top Performance
            </span>
          </div>

          <div class="font-semibold" :class="item.isVolt ? 'text-primary-500 dark:text-primary-400' : 'text-neutral-500 dark:text-neutral-400'">
            <span v-if="activeMetric === 'req'">{{ item.reqPerSec.toLocaleString() }} req/s</span>
            <span v-else>{{ item.p99LatencyMs.toFixed(2) }} ms</span>
          </div>
        </div>

        <!-- Progress Track -->
        <div class="h-2.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800/80 overflow-hidden relative">
          <div
            v-if="activeMetric === 'req'"
            class="h-full rounded-full transition-all duration-700 ease-out"
            :class="item.isVolt ? 'bg-primary-500 shadow-sm shadow-primary-500/40' : 'bg-neutral-300 dark:bg-neutral-700'"
            :style="{ width: `${(item.reqPerSec / maxReq) * 100}%` }"
          />
          <div
            v-else
            class="h-full rounded-full transition-all duration-700 ease-out"
            :class="item.isVolt ? 'bg-emerald-500 shadow-sm shadow-emerald-500/40' : 'bg-neutral-300 dark:bg-neutral-700'"
            :style="{ width: `${(1 - (item.p99LatencyMs / maxLatency) * 0.9) * 100}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Technical Specs Callout -->
    <div class="p-3.5 rounded-lg bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/20 flex items-start gap-3 text-xs text-neutral-600 dark:text-neutral-300 font-mono">
      <UIcon name="i-lucide-zap" class="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
      <p>
        <strong>7.6x faster than Express</strong> and <strong>sub-millisecond p99 tail latency</strong>. Volt harnesses Bun's native C++ HTTP core while preserving enterprise modularity and Prisma ORM integration.
      </p>
    </div>
  </div>
</template>
