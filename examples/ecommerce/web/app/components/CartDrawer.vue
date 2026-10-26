<script setup lang="ts">
const { cart, isDrawerOpen, updateQuantity, removeItem } = useCart();
</script>

<template>
  <div>
    <!-- Backdrop overlay -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isDrawerOpen"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
        @click="isDrawerOpen = false"
      />
    </Transition>

    <!-- Slideover Panel -->
    <Transition
      enter-active-class="transition duration-300 ease-out transform"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition duration-200 ease-in transform"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="isDrawerOpen"
        class="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col font-sans"
      >
        <!-- Header with Monospace Telemetry -->
        <div class="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div class="flex items-center gap-2 font-mono">
            <span class="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              [ MANIFEST // CART ]
            </span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
              {{ cart.itemCount }} ITEMS
            </span>
          </div>
          <button
            class="p-1 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            aria-label="Close cart"
            @click="isDrawerOpen = false"
          >
            <UIcon name="i-lucide-x" class="w-5 h-5" />
          </button>
        </div>

        <!-- Free Air Freight Indicator -->
        <div class="px-5 py-3 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs font-mono">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[11px] text-neutral-500 uppercase tracking-wider">AIR FREIGHT DISPATCH</span>
            <span v-if="cart.subtotal >= 150" class="text-emerald-600 dark:text-emerald-400 font-bold">
              UNLOCKED (FREE)
            </span>
            <span v-else class="text-neutral-700 dark:text-neutral-300">
              ${{ (150 - cart.subtotal).toFixed(2) }} REMAINING
            </span>
          </div>
          <div class="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary-500 transition-all duration-300"
              :style="{ width: `${Math.min(100, (cart.subtotal / 150) * 100)}%` }"
            />
          </div>
        </div>

        <!-- Items List -->
        <div class="flex-1 overflow-y-auto p-5 space-y-4">
          <div v-if="cart.items.length === 0" class="py-20 text-center space-y-3 font-mono">
            <div class="w-12 h-12 mx-auto rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 text-lg">
              ∅
            </div>
            <p class="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              MANIFEST IS CURRENTLY EMPTY
            </p>
            <p class="text-[11px] text-neutral-400 max-w-xs mx-auto font-sans">
              Select components from our catalog to stage for checkout.
            </p>
            <NuxtLink
              to="/products"
              class="inline-block mt-3 px-4 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:bg-primary-600 transition"
              @click="isDrawerOpen = false"
            >
              BROWSE REGISTRY
            </NuxtLink>
          </div>

          <div
            v-for="item in cart.items"
            :key="item.productId"
            class="flex gap-4 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/60"
          >
            <img
              :src="item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'"
              :alt="item.title"
              class="w-18 h-18 object-cover rounded-lg border border-neutral-200 dark:border-neutral-800 shrink-0 bg-neutral-100"
            />
            <div class="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h4 class="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">
                  {{ item.title }}
                </h4>
                <p class="text-[11px] font-mono text-neutral-400 mt-0.5">
                  ${{ Number(item.price).toFixed(2) }} EACH
                </p>
              </div>

              <div class="flex items-center justify-between pt-2">
                <!-- Quantity modifier -->
                <div class="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-md overflow-hidden bg-white dark:bg-neutral-900 font-mono text-xs">
                  <button
                    class="px-2 py-0.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                    @click="updateQuantity(item.productId, item.quantity - 1)"
                  >
                    -
                  </button>
                  <span class="px-2 font-bold text-neutral-900 dark:text-white">
                    {{ item.quantity }}
                  </span>
                  <button
                    class="px-2 py-0.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                    @click="updateQuantity(item.productId, item.quantity + 1)"
                  >
                    +
                  </button>
                </div>

                <!-- Price and remove -->
                <div class="flex items-center gap-3">
                  <span class="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                    ${{ Number(item.subtotal).toFixed(2) }}
                  </span>
                  <button
                    class="text-neutral-400 hover:text-red-500 transition"
                    title="Remove item"
                    @click="removeItem(item.productId)"
                  >
                    <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer / Checkout Action -->
        <div v-if="cart.items.length > 0" class="p-5 border-t border-neutral-200 dark:border-neutral-800 space-y-3 bg-neutral-50 dark:bg-neutral-950 font-mono text-xs">
          <div class="space-y-1.5 text-neutral-500">
            <div class="flex justify-between">
              <span>SUBTOTAL</span>
              <span class="font-bold text-neutral-900 dark:text-white">${{ cart.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>AIR LOGISTICS</span>
              <span class="font-bold text-neutral-900 dark:text-white">
                {{ cart.shipping === 0 ? 'FREE (0.00)' : `$${cart.shipping.toFixed(2)}` }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>ESTIMATED TAX (8.25%)</span>
              <span class="font-bold text-neutral-900 dark:text-white">${{ cart.tax.toFixed(2) }}</span>
            </div>
            <div class="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between text-sm font-bold text-neutral-900 dark:text-white">
              <span>TOTAL</span>
              <span class="text-base">${{ cart.total.toFixed(2) }}</span>
            </div>
          </div>

          <div class="pt-2 flex flex-col gap-2">
            <NuxtLink
              to="/checkout"
              class="w-full py-3 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-mono text-xs font-bold text-center hover:bg-primary-600 dark:hover:bg-neutral-200 transition-all shadow-sm active:scale-98"
              @click="isDrawerOpen = false"
            >
              PROCEED TO DISPATCH &amp; CHECKOUT →
            </NuxtLink>
            <NuxtLink
              to="/cart"
              class="w-full py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono text-xs font-semibold text-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              @click="isDrawerOpen = false"
            >
              VIEW FULL INVENTORY SHEET
            </NuxtLink>
          </div>
        </div>

      </div>
    </Transition>
  </div>
</template>
