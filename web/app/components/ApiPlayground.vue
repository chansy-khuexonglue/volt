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
  <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-neutral-100 overflow-hidden shadow-sm">
    <!-- Top toolbar -->
    <div class="p-3.5 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 font-mono">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span class="text-xs font-bold text-neutral-300 uppercase tracking-wider">Live API Sandbox</span>
      </div>

      <!-- Presets Tabs -->
      <div class="flex flex-wrap items-center gap-1.5" role="tablist">
        <button
          type="button"
          v-for="(p, idx) in presets"
          :key="p.path"
          @click="selectPreset(idx)"
          role="tab"
          :aria-selected="selectedPresetIndex === idx"
          class="px-2.5 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer active:scale-95 select-none"
          :class="selectedPresetIndex === idx ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40 font-bold' : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'"
        >
          <span :class="p.method === 'GET' ? 'text-emerald-400' : 'text-primary-400'">{{ p.method }}</span>
          {{ p.path.split('?')[0] }}
        </button>
      </div>
    </div>

    <!-- URL Bar & Send Button -->
    <div class="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center gap-3">
      <span
        class="text-xs font-mono font-bold px-2.5 py-1.5 rounded"
        :class="selectedPreset.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-primary-500/10 text-primary-400 border border-primary-500/20'"
      >
        {{ selectedPreset.method }}
      </span>

      <div class="flex-1 font-mono text-xs text-neutral-300 bg-neutral-900/90 px-3 py-2 rounded border border-neutral-800 overflow-x-auto truncate">
        http://localhost:3000{{ selectedPreset.path }}
      </div>

      <button
        type="button"
        @click="executeRequest"
        :disabled="isLoading"
        class="flex items-center gap-1.5 px-4 py-2 rounded bg-primary-500 hover:bg-primary-600 text-white font-mono text-xs font-bold shadow-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
      >
        <UIcon v-if="!isLoading" name="i-lucide-play" class="w-3.5 h-3.5 fill-current" />
        <UIcon v-else name="i-lucide-loader-2" class="w-3.5 h-3.5 animate-spin" />
        <span>{{ isLoading ? 'Executing...' : 'Send' }}</span>
      </button>
    </div>

    <!-- Request / Response Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-800 text-xs font-mono">
      <!-- Request Details -->
      <div class="p-4 space-y-3">
        <div class="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          Request Payload & Headers
        </div>
        <div v-if="selectedPreset.body" class="p-3 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 overflow-x-auto">
          <pre><code>{{ JSON.stringify(selectedPreset.body, null, 2) }}</code></pre>
        </div>
        <div v-else class="p-4 text-center text-neutral-500 italic">
          No request body (Query parameters passed via URL)
        </div>
      </div>

      <!-- Response Details -->
      <div class="p-4 space-y-3 bg-neutral-950">
        <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          <span>Response JSON</span>
          <div class="flex items-center gap-2">
            <span class="text-emerald-400 font-bold">Status {{ activeResponse.status }} OK</span>
            <span class="text-neutral-400">⚡ {{ responseTime }}ms</span>
          </div>
        </div>

        <div class="p-3 rounded bg-neutral-900/90 border border-neutral-800 text-primary-300 overflow-x-auto max-h-72">
          <pre><code>{{ JSON.stringify(activeResponse.data, null, 2) }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>
