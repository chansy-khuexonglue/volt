<script setup lang="ts">
const { cart, clear } = useCart();
const api = useApi();
const router = useRouter();

const form = ref({
  fullName: 'Alice Johnson',
  email: 'alice.johnson@example.com',
  address: '742 Evergreen Terrace',
  city: 'San Francisco',
  postalCode: '94102',
  country: 'United States',
  paymentMethod: 'credit_card',
});

const isPlacingOrder = ref(false);
const errorMessage = ref('');

const handleCheckout = async () => {
  if (cart.value.items.length === 0) {
    errorMessage.value = 'Your manifest is empty. Add hardware before initiating checkout.';
    return;
  }

  isPlacingOrder.value = true;
  errorMessage.value = '';

  try {
    const payload = {
      customerName: form.value.fullName,
      customerEmail: form.value.email,
      items: cart.value.items.map((i) => ({
        product_id: i.productId,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
      shippingAddress: {
        full_name: form.value.fullName,
        email: form.value.email,
        address: form.value.address,
        city: form.value.city,
        postal_code: form.value.postalCode,
        country: form.value.country,
      },
      paymentMethod: form.value.paymentMethod,
    };

    const res = await api.checkoutOrder(payload);

    if (res && res.success && res.data) {
      await clear();
      router.push(`/orders/${res.data.order_number}`);
    } else {
      errorMessage.value = 'Checkout transaction failed. Please retry.';
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Error communicating with checkout API';
  } finally {
    isPlacingOrder.value = false;
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 font-sans">
    
    <!-- Breadcrumb & Header -->
    <div class="border-b border-neutral-200 dark:border-neutral-800 pb-6">
      <div class="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
        <NuxtLink to="/" class="hover:text-primary-500 transition-colors">ARCHIVE</NuxtLink>
        <span>/</span>
        <NuxtLink to="/cart" class="hover:text-primary-500 transition-colors">MANIFEST</NuxtLink>
        <span>/</span>
        <span class="text-neutral-900 dark:text-white font-bold">SETTLEMENT PROTOCOL</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 dark:text-white mt-1">
        Order Dispatch &amp; Checkout
      </h1>
      <p class="text-xs text-neutral-500 font-mono mt-1">
        CONFIRM SHIPPING ADDRESS &amp; SETTLEMENT METHOD
      </p>
    </div>

    <!-- Error banner -->
    <div v-if="errorMessage" class="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-mono font-bold flex items-center gap-2 border border-red-200 dark:border-red-900">
      <UIcon name="i-lucide-alert-circle" class="w-4 h-4 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Checkout Form -->
      <div class="lg:col-span-7 space-y-6">
        <form class="space-y-6" @submit.prevent="handleCheckout">
          
          <!-- Section 01: Contact Information -->
          <div class="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div class="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
                01 // RECIPIENT INFORMATION
              </span>
              <span class="text-[10px] font-mono text-emerald-500">VERIFIED</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-[11px] font-mono text-neutral-500 uppercase mb-1">Full Legal Name</label>
                <input
                  v-model="form.fullName"
                  type="text"
                  required
                  placeholder="John Doe"
                  class="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label class="block text-[11px] font-mono text-neutral-500 uppercase mb-1">Email (Dispatch Notice)</label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  class="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <!-- Section 02: Shipping Destination -->
          <div class="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div class="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
                02 // DISPATCH DESTINATION (DHL AIR)
              </span>
              <span class="text-[10px] font-mono text-neutral-400">GLOBAL COVERAGE</span>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-[11px] font-mono text-neutral-500 uppercase mb-1">Delivery Street Address</label>
                <input
                  v-model="form.address"
                  type="text"
                  required
                  placeholder="123 Silicon Boulevard, Suite 400"
                  class="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-[11px] font-mono text-neutral-500 uppercase mb-1">City</label>
                  <input
                    v-model="form.city"
                    type="text"
                    required
                    placeholder="San Francisco"
                    class="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-mono text-neutral-500 uppercase mb-1">Postal Code</label>
                  <input
                    v-model="form.postalCode"
                    type="text"
                    required
                    placeholder="94105"
                    class="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-mono text-neutral-500 uppercase mb-1">Country</label>
                  <input
                    v-model="form.country"
                    type="text"
                    required
                    placeholder="United States"
                    class="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Section 03: Settlement Method -->
          <div class="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div class="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
                03 // SETTLEMENT CHANNEL
              </span>
              <span class="text-[10px] font-mono text-emerald-500">256-BIT ENCRYPTION</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
              <label
                class="flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition text-xs"
                :class="form.paymentMethod === 'credit_card'
                  ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'"
              >
                <input v-model="form.paymentMethod" type="radio" value="credit_card" class="text-primary-600" />
                <span>CREDIT CARD</span>
              </label>

              <label
                class="flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition text-xs"
                :class="form.paymentMethod === 'apple_pay'
                  ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'"
              >
                <input v-model="form.paymentMethod" type="radio" value="apple_pay" class="text-primary-600" />
                <span>APPLE PAY</span>
              </label>

              <label
                class="flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition text-xs"
                :class="form.paymentMethod === 'stripe'
                  ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'"
              >
                <input v-model="form.paymentMethod" type="radio" value="stripe" class="text-primary-600" />
                <span>STRIPE GATE</span>
              </label>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full py-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-mono text-sm font-black hover:bg-primary-600 dark:hover:bg-neutral-200 transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
            :disabled="isPlacingOrder"
          >
            <UIcon v-if="isPlacingOrder" name="i-lucide-loader-2" class="w-5 h-5 animate-spin" />
            <span>AUTHORIZE &amp; PLACE DISPATCH ORDER (${{ cart.total.toFixed(2) }})</span>
          </button>
        </form>
      </div>

      <!-- Right Column: Order Manifest Review -->
      <div class="lg:col-span-5 space-y-4">
        <div class="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 font-mono">
          <div class="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-neutral-500">
              MANIFEST AUDIT
            </span>
            <span class="text-xs text-neutral-900 dark:text-white font-bold">
              {{ cart.itemCount }} UNITS
            </span>
          </div>

          <!-- Staged Item Rows -->
          <div class="space-y-3 max-h-80 overflow-y-auto pr-1 divide-y divide-neutral-100 dark:divide-neutral-800">
            <div
              v-for="item in cart.items"
              :key="item.productId"
              class="flex items-center gap-3 pt-3 first:pt-0"
            >
              <img :src="item.image" class="w-12 h-12 object-cover rounded-lg border border-neutral-200 dark:border-neutral-800 shrink-0 bg-neutral-100 dark:bg-neutral-950" />
              <div class="flex-1 min-w-0">
                <h5 class="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1 font-sans">{{ item.title }}</h5>
                <p class="text-[10px] text-neutral-400 mt-0.5">QTY {{ item.quantity }} × ${{ Number(item.price).toFixed(2) }}</p>
              </div>
              <span class="text-xs font-bold text-neutral-900 dark:text-white">
                ${{ Number(item.subtotal).toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Totals -->
          <div class="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
            <div class="flex justify-between text-neutral-500">
              <span>ITEMS SUB-TOTAL</span>
              <span class="font-bold text-neutral-900 dark:text-white">${{ cart.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-neutral-500">
              <span>AIR LOGISTICS</span>
              <span class="font-bold text-neutral-900 dark:text-white">
                {{ cart.shipping === 0 ? 'FREE (0.00)' : `$${cart.shipping.toFixed(2)}` }}
              </span>
            </div>
            <div class="flex justify-between text-neutral-500">
              <span>SALES TAX (8.25%)</span>
              <span class="font-bold text-neutral-900 dark:text-white">${{ cart.tax.toFixed(2) }}</span>
            </div>
            <div class="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between text-sm font-bold text-neutral-900 dark:text-white">
              <span>TOTAL SETTLEMENT</span>
              <span class="text-base">${{ cart.total.toFixed(2) }}</span>
            </div>
          </div>

          <div class="pt-2 text-center text-[10px] text-neutral-400">
            TRANSACTION STORED DIRECTLY IN POSTGRESQL 16
          </div>
        </div>
      </div>

    </div>

  </div>
</template>
