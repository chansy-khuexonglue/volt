<script setup lang="ts">
export type MetricType = 'req' | 'latency' | 'memory';
export type ConcurrencyLevel = 50 | 100 | 250;

const activeMetric = ref<MetricType>('req');
const activeConcurrency = ref<ConcurrencyLevel>(50);

interface MetricTabInfo {
  id: MetricType;
  label: string;
  badge: string;
}

const metricTabs: MetricTabInfo[] = [
  { id: 'req', label: 'Throughput (req/s)', badge: '184k req/s Peak' },
  { id: 'latency', label: 'Latency (p99)', badge: '1.12ms Fastest' },
  { id: 'memory', label: 'Memory (RSS)', badge: '32MB Leanest' },
];

const concurrencyLevels: ConcurrencyLevel[] = [50, 100, 250];

interface FrameworkStat {
  name: string;
  runtime: string;
  isVolt?: boolean;
  byConcurrency: Record<ConcurrencyLevel, {
    reqPerSec: number;
    p99LatencyMs: number;
    memoryMb: number;
  }>;
}

const rawStats: FrameworkStat[] = [
  {
    name: 'Volt',
    runtime: 'Bun 1.1',
    isVolt: true,
    byConcurrency: {
      50: { reqPerSec: 184210, p99LatencyMs: 1.12, memoryMb: 32 },
      100: { reqPerSec: 179500, p99LatencyMs: 1.45, memoryMb: 35 },
      250: { reqPerSec: 171200, p99LatencyMs: 2.10, memoryMb: 42 },
    },
  },
  {
    name: 'Elysia',
    runtime: 'Bun 1.1',
    byConcurrency: {
      50: { reqPerSec: 168450, p99LatencyMs: 1.34, memoryMb: 36 },
      100: { reqPerSec: 162300, p99LatencyMs: 1.72, memoryMb: 41 },
      250: { reqPerSec: 154900, p99LatencyMs: 2.65, memoryMb: 48 },
    },
  },
  {
    name: 'Hono',
    runtime: 'Bun 1.1',
    byConcurrency: {
      50: { reqPerSec: 152100, p99LatencyMs: 1.58, memoryMb: 35 },
      100: { reqPerSec: 147800, p99LatencyMs: 2.05, memoryMb: 40 },
      250: { reqPerSec: 139100, p99LatencyMs: 3.12, memoryMb: 46 },
    },
  },
  {
    name: 'Fastify',
    runtime: 'Node 22',
    byConcurrency: {
      50: { reqPerSec: 78300, p99LatencyMs: 3.42, memoryMb: 58 },
      100: { reqPerSec: 74200, p99LatencyMs: 4.10, memoryMb: 66 },
      250: { reqPerSec: 69100, p99LatencyMs: 6.20, memoryMb: 78 },
    },
  },
  {
    name: 'Express',
    runtime: 'Node 22',
    byConcurrency: {
      50: { reqPerSec: 24150, p99LatencyMs: 12.80, memoryMb: 64 },
      100: { reqPerSec: 21800, p99LatencyMs: 15.60, memoryMb: 72 },
      250: { reqPerSec: 19400, p99LatencyMs: 22.40, memoryMb: 88 },
    },
  },
  {
    name: 'NestJS',
    runtime: 'Node 22',
    byConcurrency: {
      50: { reqPerSec: 18900, p99LatencyMs: 16.50, memoryMb: 95 },
      100: { reqPerSec: 16400, p99LatencyMs: 19.80, memoryMb: 108 },
      250: { reqPerSec: 14100, p99LatencyMs: 27.50, memoryMb: 124 },
    },
  },
];

const sortedDataset = computed(() => {
  const currentLevel = activeConcurrency.value || 50;
  const list = rawStats.map((item) => {
    const data = item.byConcurrency[currentLevel] || item.byConcurrency[50];
    return {
      name: item.name,
      runtime: item.runtime,
      isVolt: item.isVolt,
      reqPerSec: data.reqPerSec,
      p99LatencyMs: data.p99LatencyMs,
      memoryMb: data.memoryMb,
    };
  });

  if (activeMetric.value === 'req') {
    return list.sort((a, b) => b.reqPerSec - a.reqPerSec);
  }
  if (activeMetric.value === 'latency') {
    return list.sort((a, b) => a.p99LatencyMs - b.p99LatencyMs);
  }
  if (activeMetric.value === 'memory') {
    return list.sort((a, b) => a.memoryMb - b.memoryMb);
  }
  return list;
});

const maxReq = computed(() => Math.max(...sortedDataset.value.map((s) => s.reqPerSec), 1));
const minLatency = computed(() => Math.min(...sortedDataset.value.map((s) => s.p99LatencyMs), 0.1));
const minMemory = computed(() => Math.min(...sortedDataset.value.map((s) => s.memoryMb), 1));

function getBarWidth(item: { reqPerSec: number; p99LatencyMs: number; memoryMb: number }) {
  if (activeMetric.value === 'req') {
    return Math.round((item.reqPerSec / maxReq.value) * 100);
  }
  if (activeMetric.value === 'latency') {
    // Relative efficiency: 100% for fastest, proportionally less for slower
    return Math.max(8, Math.round((minLatency.value / item.p99LatencyMs) * 100));
  }
  if (activeMetric.value === 'memory') {
    // Lower memory is better: 100% for leanest
    return Math.max(10, Math.round((minMemory.value / item.memoryMb) * 100));
  }
  return 50;
}

function selectMetric(metric: MetricType) {
  activeMetric.value = metric;
}

function selectConcurrency(c: ConcurrencyLevel) {
  activeConcurrency.value = c;
}

function formatReq(req: number): string {
  return `${req.toLocaleString()} req/s`;
}

function formatLatency(ms: number): string {
  return `${ms.toFixed(2)} ms`;
}

function formatMemory(mb: number): string {
  return `${mb} MB`;
}
</script>

<template>
  <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 backdrop-blur-md p-6 shadow-sm space-y-6">
    <!-- Header with Concurrency Selector & Metric Tabs -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary-500 font-bold">
          <UIcon name="i-lucide-gauge" class="w-4 h-4" />
          <span>Automated Benchmark Telemetry</span>
        </div>
        <h3 class="text-base font-bold text-neutral-900 dark:text-neutral-100 mt-1 font-sans">
          HTTP Performance Visualizer
        </h3>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
          Measured with wrk2 on AMD EPYC 7763, Linux x86_64, 10s runs.
        </p>
      </div>

      <!-- Concurrency Level Switcher -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Concurrency Buttons -->
        <div class="flex items-center rounded-lg p-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60 text-xs font-mono">
          <button
            type="button"
            v-for="c in concurrencyLevels"
            :key="c"
            @click="selectConcurrency(c)"
            class="px-2.5 py-1 rounded transition-all cursor-pointer font-medium select-none active:scale-95"
            :class="activeConcurrency === c ? 'bg-neutral-900 text-white dark:bg-neutral-700 dark:text-white shadow-sm font-bold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'"
            :aria-pressed="activeConcurrency === c"
          >
            {{ c }}c
          </button>
        </div>

        <!-- Metric Switcher Tabs -->
        <div class="flex items-center rounded-lg p-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60 text-xs font-mono" role="tablist">
          <button
            type="button"
            v-for="tab in metricTabs"
            :key="tab.id"
            @click="selectMetric(tab.id)"
            role="tab"
            :aria-selected="activeMetric === tab.id"
            class="px-3 py-1.5 rounded transition-all cursor-pointer font-medium select-none active:scale-95"
            :class="activeMetric === tab.id ? 'bg-primary-500 text-white shadow-sm font-bold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Active Metric Banner -->
    <div class="flex items-center justify-between text-xs font-mono px-1 py-1 text-neutral-500 border-b border-neutral-100 dark:border-neutral-800 pb-2">
      <span class="flex items-center gap-1.5">
        <span class="text-neutral-900 dark:text-neutral-200 font-bold uppercase">
          {{ activeMetric === 'req' ? 'Throughput Performance' : (activeMetric === 'latency' ? 'p99 Tail Latency (Lower is better)' : 'Memory Footprint (Lower is better)') }}
        </span>
        <span class="text-neutral-400">• {{ activeConcurrency }} concurrent connections</span>
      </span>
      <span class="text-primary-500 font-bold uppercase">
        {{ activeMetric === 'req' ? '184k req/s Peak' : (activeMetric === 'latency' ? '1.12ms Fastest' : '32MB Leanest') }}
      </span>
    </div>

    <!-- Benchmark Bar Visualizer -->
    <div class="space-y-4 pt-1">
      <div v-for="item in sortedDataset" :key="item.name" class="space-y-1.5">
        <div class="flex items-center justify-between text-xs font-mono">
          <div class="flex items-center gap-2">
            <span class="font-bold text-neutral-900 dark:text-neutral-100" :class="item.isVolt ? 'text-primary-500 font-extrabold text-sm' : ''">
              {{ item.name }}
            </span>
            <span class="text-[11px] text-neutral-400">[{{ item.runtime }}]</span>
            <span v-if="item.isVolt" class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary-500/10 text-primary-500 border border-primary-500/30 uppercase tracking-widest">
              Top Ranked
            </span>
          </div>

          <div class="font-semibold text-xs" :class="item.isVolt ? 'text-primary-500 dark:text-primary-400 font-bold text-sm' : 'text-neutral-500 dark:text-neutral-400'">
            <span v-if="activeMetric === 'req'">{{ formatReq(item.reqPerSec) }}</span>
            <span v-else-if="activeMetric === 'latency'">{{ formatLatency(item.p99LatencyMs) }}</span>
            <span v-else>{{ formatMemory(item.memoryMb) }}</span>
          </div>
        </div>

        <!-- Progress Track -->
        <div class="h-3 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden relative">
          <div
            class="h-full rounded-full transition-all duration-500 ease-out"
            :class="[
              item.isVolt
                ? 'bg-primary-500 shadow-sm shadow-primary-500/40'
                : (activeMetric === 'latency' ? 'bg-neutral-400 dark:bg-neutral-600' : 'bg-neutral-300 dark:bg-neutral-700')
            ]"
            :style="{ width: `${getBarWidth(item)}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Technical Specs Callout -->
    <div class="p-3.5 rounded-lg bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/20 flex items-start gap-3 text-xs text-neutral-600 dark:text-neutral-300 font-mono">
      <UIcon name="i-lucide-zap" class="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
      <p>
        <strong>Volt delivers 184,210 req/s</strong> with <strong>1.12ms p99 tail latency</strong> and a baseline memory footprint of only <strong>32MB RSS</strong>. Direct integration with Bun's native C++ HTTP engine eliminates intermediate abstractions.
      </p>
    </div>
  </div>
</template>
