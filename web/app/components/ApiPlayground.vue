<script setup lang="ts">
interface EndpointPreset {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  headers?: Record<string, string>;
  body?: any;
  response: {
    status: number;
    data: any;
  };
}

const presets: EndpointPreset[] = [
  {
    method: 'GET',
    path: '/health',
    description: 'System health check and database/Prisma plugin status',
    response: {
      status: 200,
      data: {
        status: 'ok',
        uptime: 142.85,
        database: 'connected',
        orm: 'Prisma Plugin (@volt/plugin-prisma)',
        framework: 'Volt',
        runtime: 'Bun v1.4.4',
      },
    },
  },
  {
    method: 'GET',
    path: '/api/products?limit=2&category=audio',
    description: 'Query products catalog with type-coerced query params',
    response: {
      status: 200,
      data: {
        success: true,
        count: 2,
        total: 8,
        products: [
          {
            id: 'prod-sony-wh1000xm5',
            title: 'Sony WH-1000XM5 Wireless Headphones',
            price: 399.99,
            category: 'Smart Audio',
            rating: 4.85,
          },
          {
            id: 'prod-apple-airpods-max',
            title: 'Apple AirPods Max (Space Gray)',
            price: 549.0,
            category: 'Smart Audio',
            rating: 4.7,
          },
        ],
      },
    },
  },
  {
    method: 'POST',
    path: '/api/orders/checkout',
    description: 'Create new verified order via Prisma ORM',
    body: {
      customerName: 'Sarah Connor',
      customerEmail: 'sarah@resistance.dev',
      paymentMethod: 'stripe',
      items: [
        { product_id: 'prod-sony-wh1000xm5', quantity: 1, price: 399.99 },
      ],
    },
    response: {
      status: 201,
      data: {
        success: true,
        order_number: 'ORD-89421',
        total_amount: 399.99,
        status: 'confirmed',
        created_at: new Date().toISOString(),
      },
    },
  },
];

const selectedPresetIndex = ref(0);
const selectedPreset = computed(() => presets[selectedPresetIndex.value]);

const isLoading = ref(false);
const activeResponse = ref<any>(presets[0].response);
const responseTime = ref<number>(0.84);

function executeRequest() {
  isLoading.value = true;
  const start = performance.now();
  setTimeout(() => {
    activeResponse.value = selectedPreset.value.response;
    responseTime.value = Number((performance.now() - start + Math.random() * 0.4).toFixed(2));
    isLoading.value = false;
  }, 120);
}

function selectPreset(idx: number) {
  selectedPresetIndex.value = idx;
  executeRequest();
}
</script>

<template>
  <div class="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 overflow-hidden shadow-2xl">
    <!-- Top toolbar -->
    <div class="p-4 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
        <span class="text-xs font-mono font-semibold text-zinc-300">Live API Sandbox</span>
      </div>

      <!-- Presets Tabs -->
      <div class="flex flex-wrap items-center gap-1.5">
        <button
          v-for="(p, idx) in presets"
          :key="p.path"
          @click="selectPreset(idx)"
          class="px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all"
          :class="selectedPresetIndex === idx ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'"
        >
          <span :class="p.method === 'GET' ? 'text-emerald-400' : 'text-blue-400'">{{ p.method }}</span>
          {{ p.path.split('?')[0] }}
        </button>
      </div>
    </div>

    <!-- URL Bar & Send Button -->
    <div class="p-4 bg-zinc-950 border-b border-zinc-800/80 flex items-center gap-3">
      <span
        class="text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg"
        :class="selectedPreset.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'"
      >
        {{ selectedPreset.method }}
      </span>

      <div class="flex-1 font-mono text-xs text-zinc-300 bg-zinc-900/80 px-3 py-2 rounded-lg border border-zinc-800 overflow-x-auto truncate">
        http://localhost:3000{{ selectedPreset.path }}
      </div>

      <button
        @click="executeRequest"
        :disabled="isLoading"
        class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-bold shadow-md shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
      >
        <UIcon v-if="!isLoading" name="i-lucide-play" class="w-3.5 h-3.5 fill-current" />
        <UIcon v-else name="i-lucide-loader-2" class="w-3.5 h-3.5 animate-spin" />
        <span>{{ isLoading ? 'Executing...' : 'Send' }}</span>
      </button>
    </div>

    <!-- Request / Response Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800 text-xs font-mono">
      <!-- Request Details -->
      <div class="p-4 space-y-3">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Request Payload & Headers
        </div>
        <div v-if="selectedPreset.body" class="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 overflow-x-auto">
          <pre><code>{{ JSON.stringify(selectedPreset.body, null, 2) }}</code></pre>
        </div>
        <div v-else class="p-4 text-center text-zinc-500 italic">
          No request body (Query parameters passed via URL)
        </div>
      </div>

      <!-- Response Details -->
      <div class="p-4 space-y-3 bg-zinc-950/80">
        <div class="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          <span>Response JSON</span>
          <div class="flex items-center gap-2">
            <span class="text-emerald-400 font-bold">Status {{ activeResponse.status }} OK</span>
            <span class="text-zinc-400">⚡ {{ responseTime }}ms</span>
          </div>
        </div>

        <div class="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 text-cyan-300 overflow-x-auto max-h-72">
          <pre><code>{{ JSON.stringify(activeResponse.data, null, 2) }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>
