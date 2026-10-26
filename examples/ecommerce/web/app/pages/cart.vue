<script setup lang="ts">
const { cart, updateQuantity, removeItem, clear } = useCart();
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 font-sans">
    
    <!-- Header -->
    <div class="border-b border-neutral-200 dark:border-neutral-800 pb-6">
      <div class="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
        <NuxtLink to="/" class="hover:text-primary-500 transition-colors">ARCHIVE</NuxtLink>
        <span>/</span>
        <span class="text-neutral-900 dark:text-white font-bold">MANIFEST REVIEW</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 dark:text-white mt-1">
        Inventory Manifest
      </h1>
      <p class="text-xs text-neutral-500 font-mono mt-1">
        {{ cart.itemCount }} HARDWARE UNITS STAGED FOR DISPATCH
      </p>
    </div>

    <!-- Empty State -->
    <div v-if="cart.items.length === 0" class="py-24 text-center space-y-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 font-mono">
      <div class="w-12 h-12 mx-auto rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 text-xl">
        ∅
      </div>
      <h2 class="text-base font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
        NO COMPONENTS STAGED IN MANIFEST
      </h2>
      <p class="text-xs text-neutral-400 max-w-sm mx-auto font-sans">
        Review the hardware catalog and acquire components to initiate your order.
      </p>
      <NuxtLink
        to="/products"
        class="inline-block mt-2 px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-mono text-xs font-bold hover:bg-primary-600 transition"
      >
        BROWSE REGISTRY CATALOG
      </NuxtLink>
    </div>

    <!-- Active Cart Layout -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Items Manifest List -->
      <div class="lg:col-span-8 space-y-4">
        <div class="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6">
          <div
            v-for="item in cart.items"
            :key="item.productId"
            class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0 last:pb-0"
          >
            <div class="flex items-center gap-4">
              <img
                :src="item.image"
                :alt="item.title"
                class="w-18 h-18 object-cover rounded-xl border border-neutral-200 dark:border-neutral-800 shrink-0 bg-neutral-100 dark:bg-neutral-950"
              />
              <div class="space-y-0.5">
                <NuxtLink :to="`/products/${item.productId}`" class="font-bold text-sm text-neutral-900 dark:text-white hover:text-primary-500 transition line-clamp-1">
                  {{ item.title }}
                </NuxtLink>
                <p class="text-xs font-mono text-neutral-400">
                  ${{ Number(item.price).toFixed(2) }} UNIT PRICE
                </p>
              </div>
            </div>

            <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto font-mono">
              <!-- Quantity -->
              <div class="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-950 text-xs">
                <button
                  class="px-2.5 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  @click="updateQuantity(item.productId, item.quantity - 1)"
                >
                  -
                </button>
                <span class="px-3 font-bold text-neutral-900 dark:text-white">
                  {{ item.quantity }}
                </span>
                <button
                  class="px-2.5 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  @click="updateQuantity(item.productId, item.quantity + 1)"
                >
                  +
                </button>
              </div>

              <!-- Subtotal -->
              <span class="font-bold text-sm text-neutral-900 dark:text-white min-w-[70px] text-right">
                ${{ Number(item.subtotal).toFixed(2) }}
              </span>

              <!-- Remove -->
              <button
                class="text-neutral-400 hover:text-red-500 transition"
                title="Remove item"
                @click="removeItem(item.productId)"
              >
                <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="pt-4 flex justify-between items-center text-xs font-mono">
            <NuxtLink
              to="/products"
              class="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition flex items-center gap-1.5"
            >
              ← CONTINUE EXPLORING
            </NuxtLink>
            <button
              class="text-neutral-400 hover:text-red-500 transition"
              @click="clear"
            >
              CLEAR MANIFEST
            </button>
          </div>
        </div>
      </div>

      <!-- Manifest Total Summary -->
      <div class="lg:col-span-4 space-y-4">
        <div class="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-5 font-mono">
          <h3 class="font-bold text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            LOGISTICS &amp; SETTLEMENT
          </h3>

          <div class="space-y-2 text-xs">
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
            <div class="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-between text-sm font-bold text-neutral-900 dark:text-white">
              <span>FINAL TOTAL</span>
              <span class="text-base">${{ cart.total.toFixed(2) }}</span>
            </div>
          </div>

          <NuxtLink
            to="/checkout"
            class="block w-full py-3 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-mono text-xs font-bold text-center hover:bg-primary-600 dark:hover:bg-neutral-200 transition shadow-sm"
          >
            CONFIRM &amp; INITIATE DISPATCH →
          </NuxtLink>

          <div class="text-center text-[10px] text-neutral-400">
            ENCRYPTED POSTGRES ACID TRANSACTION
          </div>
        </div>
      </div>

    </div>

  </div>
</template>
