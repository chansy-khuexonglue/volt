<script setup lang="ts">
const { cart, updateQuantity, removeItem, clear } = useCart();
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    <div class="space-y-2">
      <div class="flex items-center gap-2 text-xs text-neutral-500">
        <NuxtLink to="/" class="hover:text-primary-500">Home</NuxtLink>
        <span>/</span>
        <span class="text-neutral-900 dark:text-white font-medium">Shopping Cart</span>
      </div>
      <h1 class="text-3xl font-extrabold text-neutral-900 dark:text-white">
        Shopping Cart ({{ cart.itemCount }})
      </h1>
    </div>

    <!-- Empty State -->
    <div v-if="cart.items.length === 0" class="py-20 text-center space-y-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8">
      <div class="w-20 h-20 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
        <UIcon name="i-lucide-shopping-cart" class="w-10 h-10" />
      </div>
      <h2 class="text-xl font-bold text-neutral-900 dark:text-white">Your cart is empty</h2>
      <p class="text-xs text-neutral-500 max-w-sm mx-auto">
        Explore our curated hardware selection and add products to start your order.
      </p>
      <UButton to="/products" color="primary" size="lg" class="mt-4">
        Explore Products
      </UButton>
    </div>

    <!-- Active Cart Layout -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Items Table / List -->
      <div class="lg:col-span-2 space-y-4">
        <div class="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6">
          <div
            v-for="item in cart.items"
            :key="item.productId"
            class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0 last:pb-0"
          >
            <div class="flex items-center gap-4">
              <img
                :src="item.image"
                :alt="item.title"
                class="w-20 h-20 object-cover rounded-xl border border-neutral-200 dark:border-neutral-700 shrink-0"
              />
              <div>
                <NuxtLink :to="`/products/${item.productId}`" class="font-bold text-sm text-neutral-900 dark:text-white hover:text-primary-500 transition line-clamp-1">
                  {{ item.title }}
                </NuxtLink>
                <p class="text-xs text-neutral-500 mt-1">
                  ${{ Number(item.price).toFixed(2) }}
                </p>
              </div>
            </div>

            <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
              <!-- Quantity -->
              <div class="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-950">
                <button
                  class="px-2.5 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-xs"
                  @click="updateQuantity(item.productId, item.quantity - 1)"
                >
                  <UIcon name="i-lucide-minus" class="w-3.5 h-3.5" />
                </button>
                <span class="px-3 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  {{ item.quantity }}
                </span>
                <button
                  class="px-2.5 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-xs"
                  @click="updateQuantity(item.productId, item.quantity + 1)"
                >
                  <UIcon name="i-lucide-plus" class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Subtotal -->
              <span class="font-bold text-sm text-neutral-900 dark:text-white min-w-[70px] text-right">
                ${{ Number(item.subtotal).toFixed(2) }}
              </span>

              <!-- Remove -->
              <button
                class="text-neutral-400 hover:text-red-500 transition"
                title="Remove"
                @click="removeItem(item.productId)"
              >
                <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="pt-4 flex justify-between items-center text-xs">
            <UButton
              to="/products"
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-left"
              size="sm"
            >
              Continue Shopping
            </UButton>
            <button
              class="text-neutral-400 hover:text-red-500 transition font-medium"
              @click="clear"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>

      <!-- Order Summary Card -->
      <div class="space-y-4">
        <div class="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm">
          <h3 class="font-bold text-base text-neutral-900 dark:text-white">
            Order Summary
          </h3>

          <div class="space-y-2 text-xs">
            <div class="flex justify-between text-neutral-500">
              <span>Items Subtotal</span>
              <span class="font-medium text-neutral-900 dark:text-white">${{ cart.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-neutral-500">
              <span>Shipping Fee</span>
              <span class="font-medium text-neutral-900 dark:text-white">
                {{ cart.shipping === 0 ? 'FREE' : `$${cart.shipping.toFixed(2)}` }}
              </span>
            </div>
            <div class="flex justify-between text-neutral-500">
              <span>Estimated Sales Tax</span>
              <span class="font-medium text-neutral-900 dark:text-white">${{ cart.tax.toFixed(2) }}</span>
            </div>
            <div class="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-between text-base font-extrabold text-neutral-900 dark:text-white">
              <span>Estimated Total</span>
              <span>${{ cart.total.toFixed(2) }}</span>
            </div>
          </div>

          <UButton
            to="/checkout"
            color="primary"
            variant="solid"
            block
            size="lg"
            class="mt-4 font-bold rounded-xl shadow-lg shadow-primary-500/25"
          >
            Checkout with Credit Card
          </UButton>

          <div class="pt-2 text-center text-[11px] text-neutral-400">
            🔒 256-Bit Encrypted Secure Checkout
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
