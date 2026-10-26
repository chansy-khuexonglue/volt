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
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
    <div v-if="pending" class="text-center py-20">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin mx-auto text-primary-500" />
      <p class="text-sm text-neutral-400 mt-2">Loading order confirmation...</p>
    </div>

    <div v-else-if="error || !order" class="text-center py-16 space-y-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8">
      <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-red-500 mx-auto" />
      <h2 class="text-xl font-bold text-neutral-900 dark:text-white">Order Not Found</h2>
      <p class="text-xs text-neutral-500">We could not locate this order in the PostgreSQL database.</p>
      <UButton to="/products" color="primary">Continue Shopping</UButton>
    </div>

    <div v-else class="space-y-8">
      <!-- Success Banner -->
      <div class="text-center space-y-3">
        <div class="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
          <UIcon name="i-lucide-check" class="w-8 h-8" />
        </div>
        <h1 class="text-3xl font-extrabold text-neutral-900 dark:text-white">
          Order Confirmed!
        </h1>
        <p class="text-sm text-neutral-500">
          Thank you for your order, <strong class="text-neutral-800 dark:text-neutral-200">{{ order.customer_name }}</strong>.
          We've sent a confirmation receipt to <strong class="text-neutral-800 dark:text-neutral-200">{{ order.customer_email }}</strong>.
        </p>
      </div>

      <!-- Receipt Card -->
      <div class="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <span class="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Order Number</span>
            <div class="text-lg font-mono font-bold text-neutral-900 dark:text-white">{{ order.order_number }}</div>
          </div>
          <div>
            <span class="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Status</span>
            <div>
              <UBadge color="success" variant="subtle" size="md" class="capitalize">
                {{ order.status }}
              </UBadge>
            </div>
          </div>
          <div>
            <span class="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Date Placed</span>
            <div class="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              {{ new Date(order.created_at).toLocaleDateString() }}
            </div>
          </div>
        </div>

        <!-- Shipping info -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <h4 class="font-bold text-neutral-900 dark:text-white mb-1">Shipping Address</h4>
            <p class="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {{ address.full_name }}<br />
              {{ address.address }}<br />
              {{ address.city }}, {{ address.postal_code }}<br />
              {{ address.country }}
            </p>
          </div>
          <div>
            <h4 class="font-bold text-neutral-900 dark:text-white mb-1">Payment Method</h4>
            <p class="text-neutral-600 dark:text-neutral-400 capitalize">
              {{ order.payment_method?.replace('_', ' ') }}
            </p>
          </div>
        </div>

        <!-- Items Table -->
        <div class="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
          <h4 class="font-bold text-sm text-neutral-900 dark:text-white">Items Ordered</h4>
          <div class="space-y-3">
            <div
              v-for="(item, idx) in items"
              :key="idx"
              class="flex items-center justify-between text-xs py-2 border-b border-neutral-100 dark:border-neutral-800/60 last:border-0"
            >
              <div class="flex items-center gap-3">
                <img :src="item.image" class="w-12 h-12 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700 shrink-0" />
                <div>
                  <h5 class="font-semibold text-neutral-900 dark:text-white">{{ item.title }}</h5>
                  <p class="text-neutral-400">Qty: {{ item.quantity }}</p>
                </div>
              </div>
              <span class="font-bold text-neutral-900 dark:text-white">
                ${{ (Number(item.price) * Number(item.quantity)).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Totals breakdown -->
        <div class="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
          <div class="flex justify-between text-neutral-500">
            <span>Subtotal</span>
            <span class="font-medium text-neutral-900 dark:text-white">${{ Number(order.subtotal).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-neutral-500">
            <span>Shipping</span>
            <span class="font-medium text-neutral-900 dark:text-white">
              {{ Number(order.shipping_fee) === 0 ? 'FREE' : `$${Number(order.shipping_fee).toFixed(2)}` }}
            </span>
          </div>
          <div class="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-between text-base font-extrabold text-neutral-900 dark:text-white">
            <span>Total Paid</span>
            <span>${{ Number(order.total_amount).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <div class="flex justify-center gap-4">
        <UButton to="/products" color="primary" size="lg" class="rounded-xl px-6">
          Continue Shopping
        </UButton>
      </div>
    </div>
  </div>
</template>
