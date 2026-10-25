<script setup lang="ts">
const { cart, isDrawerOpen, updateQuantity, removeItem, clear } = useCart();
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
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
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
        class="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col"
      >
        <!-- Header -->
        <div class="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-shopping-bag" class="w-5 h-5 text-primary-500" />
            <h2 class="text-lg font-bold text-neutral-900 dark:text-white">Your Cart</h2>
            <UBadge color="primary" variant="subtle" size="sm">
              {{ cart.itemCount }}
            </UBadge>
          </div>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="isDrawerOpen = false"
          />
        </div>

        <!-- Free shipping banner -->
        <div class="px-5 py-3 bg-primary-50 dark:bg-primary-950/40 border-b border-primary-100 dark:border-primary-900/40 text-xs flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-primary-700 dark:text-primary-300 font-medium">
            <UIcon name="i-lucide-truck" class="w-4 h-4" />
            <span v-if="cart.subtotal >= 150">You've unlocked FREE Express Shipping!</span>
            <span v-else>Add ${{ (150 - cart.subtotal).toFixed(2) }} more for FREE Shipping</span>
          </div>
        </div>

        <!-- Items List -->
        <div class="flex-1 overflow-y-auto p-5 space-y-4">
          <div v-if="cart.items.length === 0" class="py-16 text-center space-y-3">
            <div class="w-16 h-16 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
              <UIcon name="i-lucide-shopping-cart" class="w-8 h-8" />
            </div>
            <p class="text-sm font-medium text-neutral-600 dark:text-neutral-300">Your cart is currently empty</p>
            <p class="text-xs text-neutral-400 max-w-xs mx-auto">Browse our collection of next-gen minimalist hardware and add items to your cart.</p>
            <UButton
              to="/products"
              color="primary"
              variant="outline"
              size="sm"
              class="mt-2"
              @click="isDrawerOpen = false"
            >
              Start Shopping
            </UButton>
          </div>

          <div
            v-for="item in cart.items"
            :key="item.productId"
            class="flex gap-4 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30"
          >
            <img
              :src="item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'"
              :alt="item.title"
              class="w-20 h-20 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700 flex-shrink-0"
            />
            <div class="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h4 class="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-1">
                  {{ item.title }}
                </h4>
                <p class="text-xs text-neutral-500 mt-0.5">
                  ${{ Number(item.price).toFixed(2) }} each
                </p>
              </div>

              <div class="flex items-center justify-between pt-2">
                <!-- Quantity modifier -->
                <div class="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-900">
                  <button
                    class="px-2 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs transition"
                    @click="updateQuantity(item.productId, item.quantity - 1)"
                  >
                    <UIcon name="i-lucide-minus" class="w-3.5 h-3.5" />
                  </button>
                  <span class="px-2.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    {{ item.quantity }}
                  </span>
                  <button
                    class="px-2 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs transition"
                    @click="updateQuantity(item.productId, item.quantity + 1)"
                  >
                    <UIcon name="i-lucide-plus" class="w-3.5 h-3.5" />
                  </button>
                </div>

                <!-- Price and remove -->
                <div class="flex items-center gap-3">
                  <span class="text-sm font-bold text-neutral-900 dark:text-white">
                    ${{ Number(item.subtotal).toFixed(2) }}
                  </span>
                  <button
                    class="text-neutral-400 hover:text-red-500 transition"
                    title="Remove item"
                    @click="removeItem(item.productId)"
                  >
                    <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer / Checkout -->
        <div v-if="cart.items.length > 0" class="p-5 border-t border-neutral-200 dark:border-neutral-800 space-y-3 bg-neutral-50 dark:bg-neutral-900/90">
          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between text-neutral-500">
              <span>Subtotal</span>
              <span class="font-medium text-neutral-800 dark:text-neutral-200">${{ cart.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-neutral-500">
              <span>Estimated Shipping</span>
              <span class="font-medium text-neutral-800 dark:text-neutral-200">
                {{ cart.shipping === 0 ? 'FREE' : `$${cart.shipping.toFixed(2)}` }}
              </span>
            </div>
            <div class="flex justify-between text-neutral-500">
              <span>Estimated Tax (8%)</span>
              <span class="font-medium text-neutral-800 dark:text-neutral-200">${{ cart.tax.toFixed(2) }}</span>
            </div>
            <div class="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between text-sm font-bold text-neutral-900 dark:text-white">
              <span>Total</span>
              <span>${{ cart.total.toFixed(2) }}</span>
            </div>
          </div>

          <div class="pt-2 flex flex-col gap-2">
            <UButton
              to="/checkout"
              color="primary"
              variant="solid"
              block
              size="lg"
              class="font-semibold shadow-lg shadow-primary-500/25"
              @click="isDrawerOpen = false"
            >
              Proceed to Checkout
            </UButton>
            <UButton
              to="/cart"
              color="neutral"
              variant="outline"
              block
              size="sm"
              @click="isDrawerOpen = false"
            >
              View Full Cart
            </UButton>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
