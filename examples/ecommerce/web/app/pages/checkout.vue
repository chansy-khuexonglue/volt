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
    errorMessage.value = 'Your cart is empty. Add products before placing an order.';
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
      errorMessage.value = 'Checkout failed. Please try again.';
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Error communicating with checkout API';
  } finally {
    isPlacingOrder.value = false;
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    <div class="space-y-2">
      <div class="flex items-center gap-2 text-xs text-neutral-500">
        <NuxtLink to="/" class="hover:text-primary-500">Home</NuxtLink>
        <span>/</span>
        <NuxtLink to="/cart" class="hover:text-primary-500">Cart</NuxtLink>
        <span>/</span>
        <span class="text-neutral-900 dark:text-white font-medium">Checkout</span>
      </div>
      <h1 class="text-3xl font-extrabold text-neutral-900 dark:text-white">
        Checkout & Shipping
      </h1>
    </div>

    <div v-if="errorMessage" class="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
      <UIcon name="i-lucide-alert-circle" class="w-4 h-4 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Checkout Form -->
      <div class="lg:col-span-2 space-y-6">
        <form class="space-y-6" @submit.prevent="handleCheckout">
          <!-- Contact details -->
          <div class="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 class="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-lucide-user" class="w-4 h-4 text-primary-500" />
              <span>Contact Information</span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Full Name</label>
                <input
                  v-model="form.fullName"
                  type="text"
                  required
                  placeholder="John Doe"
                  class="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email Address</label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  class="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <!-- Shipping Address -->
          <div class="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 class="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-primary-500" />
              <span>Shipping Address</span>
            </h3>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Street Address</label>
                <input
                  v-model="form.address"
                  type="text"
                  required
                  placeholder="123 Silicon Boulevard, Suite 400"
                  class="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">City</label>
                  <input
                    v-model="form.city"
                    type="text"
                    required
                    placeholder="San Francisco"
                    class="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Postal Code</label>
                  <input
                    v-model="form.postalCode"
                    type="text"
                    required
                    placeholder="94105"
                    class="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Country</label>
                  <input
                    v-model="form.country"
                    type="text"
                    required
                    placeholder="United States"
                    class="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 class="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-lucide-credit-card" class="w-4 h-4 text-primary-500" />
              <span>Payment Method</span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                class="flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition"
                :class="form.paymentMethod === 'credit_card' ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/20' : 'border-neutral-200 dark:border-neutral-800'"
              >
                <input v-model="form.paymentMethod" type="radio" value="credit_card" class="text-primary-600" />
                <span class="text-xs font-semibold text-neutral-900 dark:text-white">Credit Card</span>
              </label>

              <label
                class="flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition"
                :class="form.paymentMethod === 'apple_pay' ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/20' : 'border-neutral-200 dark:border-neutral-800'"
              >
                <input v-model="form.paymentMethod" type="radio" value="apple_pay" class="text-primary-600" />
                <span class="text-xs font-semibold text-neutral-900 dark:text-white">Apple Pay</span>
              </label>

              <label
                class="flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition"
                :class="form.paymentMethod === 'stripe' ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/20' : 'border-neutral-200 dark:border-neutral-800'"
              >
                <input v-model="form.paymentMethod" type="radio" value="stripe" class="text-primary-600" />
                <span class="text-xs font-semibold text-neutral-900 dark:text-white">Stripe Checkout</span>
              </label>
            </div>
          </div>

          <UButton
            type="submit"
            color="primary"
            variant="solid"
            size="xl"
            block
            :loading="isPlacingOrder"
            class="font-bold rounded-2xl shadow-xl shadow-primary-500/25"
          >
            Authorize & Place Order (${{ cart.total.toFixed(2) }})
          </UButton>
        </form>
      </div>

      <!-- Order Review Sidebar -->
      <div class="space-y-4">
        <div class="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <h3 class="font-bold text-base text-neutral-900 dark:text-white">
            Order Review ({{ cart.itemCount }} items)
          </h3>

          <div class="space-y-3 max-h-80 overflow-y-auto pr-1 divide-y divide-neutral-100 dark:divide-neutral-800">
            <div
              v-for="item in cart.items"
              :key="item.productId"
              class="flex items-center gap-3 pt-3 first:pt-0"
            >
              <img :src="item.image" class="w-12 h-12 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700 shrink-0" />
              <div class="flex-1 min-w-0">
                <h5 class="text-xs font-semibold text-neutral-900 dark:text-white line-clamp-1">{{ item.title }}</h5>
                <p class="text-[11px] text-neutral-400">Qty: {{ item.quantity }} × ${{ Number(item.price).toFixed(2) }}</p>
              </div>
              <span class="text-xs font-bold text-neutral-900 dark:text-white">
                ${{ Number(item.subtotal).toFixed(2) }}
              </span>
            </div>
          </div>

          <div class="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
            <div class="flex justify-between text-neutral-500">
              <span>Subtotal</span>
              <span class="font-medium text-neutral-800 dark:text-neutral-200">${{ cart.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-neutral-500">
              <span>Shipping</span>
              <span class="font-medium text-neutral-800 dark:text-neutral-200">
                {{ cart.shipping === 0 ? 'FREE' : `$${cart.shipping.toFixed(2)}` }}
              </span>
            </div>
            <div class="flex justify-between text-neutral-500">
              <span>Estimated Tax (8%)</span>
              <span class="font-medium text-neutral-800 dark:text-neutral-200">${{ cart.tax.toFixed(2) }}</span>
            </div>
            <div class="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between text-sm font-extrabold text-neutral-900 dark:text-white">
              <span>Total Due</span>
              <span>${{ cart.total.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
