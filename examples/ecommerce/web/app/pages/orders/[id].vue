<script setup lang="ts">
const route = useRoute();
const api = useApi();
const orderId = computed(() => route.params.id as string);

const { data: orderData, pending, error, refresh: refreshOrder } = await useAsyncData(
  () => api.getOrder(orderId.value),
  {
    watch: [orderId],
  }
);

const order = computed(() => orderData.value?.data);

onMounted(() => {
  if (!order.value) refreshOrder();
});

const items = computed(() => {
  if (!order.value?.items) return [];
  if (typeof order.value.items === 'string') {
    try {
      return JSON.parse(order.value.items);
    } catch {
      return [];
    }
  }
  return order.value.items;
});

const address = computed(() => {
  if (!order.value?.shipping_address) return {};
  if (typeof order.value.shipping_address === 'string') {
    try {
      return JSON.parse(order.value.shipping_address);
    } catch {
      return {};
    }
  }
  return order.value.shipping_address;
});
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-8 font-sans">
    
    <div v-if="pending" class="text-center py-24 font-mono text-xs">
      <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin mx-auto text-primary-500 mb-2" />
      <p class="text-neutral-400">RETRIEVING DISPATCH RECORD...</p>
    </div>

    <div v-else-if="error || !order" class="text-center py-20 space-y-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 font-mono">
      <div class="text-red-500 text-2xl">!</div>
      <h2 class="text-base font-bold text-neutral-900 dark:text-white uppercase">DISPATCH RECORD NOT LOCATED</h2>
      <p class="text-xs text-neutral-400 max-w-sm mx-auto font-sans">
        The specified order identifier was not found in the live PostgreSQL transaction database.
      </p>
      <NuxtLink
        to="/products"
        class="inline-block mt-2 px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-mono text-xs font-bold hover:bg-primary-600 transition"
      >
        RETURN TO REGISTRY
      </NuxtLink>
    </div>

    <div v-else class="space-y-8">
      
      <!-- Confirmation Banner -->
      <div class="text-center space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-300 dark:border-emerald-800 mb-2">
          <span>✓ DISPATCH CONFIRMED // SERIALIZED</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
          Order Dispatched
        </h1>
        <p class="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
          Transaction recorded for <strong class="text-neutral-900 dark:text-white">{{ order.customer_name }}</strong>. Electronic delivery docket transmitted to <strong class="text-neutral-900 dark:text-white">{{ order.customer_email }}</strong>.
        </p>
      </div>

      <!-- Physical-style Receipt / Waybill Card -->
      <div class="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6 font-mono text-xs shadow-sm">
        
        <!-- Header Info -->
        <div class="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <span class="text-[10px] text-neutral-400 uppercase tracking-wider block">DISPATCH NUMBER</span>
            <div class="text-base font-bold text-neutral-900 dark:text-white mt-0.5">{{ order.order_number }}</div>
          </div>
          <div>
            <span class="text-[10px] text-neutral-400 uppercase tracking-wider block">STATUS</span>
            <span class="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 uppercase border border-emerald-300 dark:border-emerald-800">
              {{ order.status }}
            </span>
          </div>
          <div>
            <span class="text-[10px] text-neutral-400 uppercase tracking-wider block">TIMESTAMP</span>
            <div class="text-xs text-neutral-700 dark:text-neutral-300 mt-0.5">
              {{ new Date(order.created_at).toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- Destination & Settlement -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h4 class="font-bold text-neutral-500 uppercase text-[10px] tracking-wider mb-1.5">
              // RECIPIENT &amp; AIR DISPATCH
            </h4>
            <p class="text-neutral-900 dark:text-white leading-relaxed font-sans text-xs">
              <strong>{{ address.full_name }}</strong><br />
              {{ address.address }}<br />
              {{ address.city }}, {{ address.postal_code }}<br />
              {{ address.country }}
            </p>
          </div>
          <div>
            <h4 class="font-bold text-neutral-500 uppercase text-[10px] tracking-wider mb-1.5">
              // SETTLEMENT PROTOCOL
            </h4>
            <p class="text-neutral-900 dark:text-white uppercase font-sans text-xs">
              {{ order.payment_method?.replace('_', ' ') }}
            </p>
            <span class="text-[10px] text-neutral-400 block mt-1">
              PROCESSED VIA VOLT FINANCIAL BUS
            </span>
          </div>
        </div>

        <!-- Component List -->
        <div class="space-y-4">
          <h4 class="font-bold text-neutral-500 uppercase text-[10px] tracking-wider">
            // MANIFEST INVENTORY
          </h4>
          <div class="space-y-3">
            <div
              v-for="(item, idx) in items"
              :key="idx"
              class="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800/80 last:border-0"
            >
              <div class="flex items-center gap-3">
                <img :src="item.image" class="w-10 h-10 object-cover rounded border border-neutral-200 dark:border-neutral-800 shrink-0 bg-neutral-100 dark:bg-neutral-950" />
                <div>
                  <h5 class="font-bold text-neutral-900 dark:text-white font-sans text-xs line-clamp-1">{{ item.title }}</h5>
                  <p class="text-[10px] text-neutral-400">QTY {{ item.quantity }} × ${{ Number(item.price).toFixed(2) }}</p>
                </div>
              </div>
              <span class="font-bold text-neutral-900 dark:text-white text-xs">
                ${{ (Number(item.price) * Number(item.quantity)).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Totals -->
        <div class="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
          <div class="flex justify-between text-neutral-500">
            <span>SUB-TOTAL</span>
            <span class="font-bold text-neutral-900 dark:text-white">${{ Number(order.subtotal).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-neutral-500">
            <span>AIR FREIGHT</span>
            <span class="font-bold text-neutral-900 dark:text-white">
              {{ Number(order.shipping_fee) === 0 ? 'FREE (0.00)' : `$${Number(order.shipping_fee).toFixed(2)}` }}
            </span>
          </div>
          <div class="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between text-sm font-bold text-neutral-900 dark:text-white">
            <span>TOTAL SETTLED</span>
            <span class="text-base">${{ Number(order.total_amount).toFixed(2) }}</span>
          </div>
        </div>

      </div>

      <!-- Action Button -->
      <div class="flex justify-center pt-2">
        <NuxtLink
          to="/products"
          class="px-6 py-3 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-mono text-xs font-bold hover:bg-primary-600 transition"
        >
          RETURN TO REGISTRY CATALOG →
        </NuxtLink>
      </div>

    </div>
  </div>
</template>
