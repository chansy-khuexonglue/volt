<script setup lang="ts">
const { cart, isDrawerOpen } = useCart();
const router = useRouter();
const searchQuery = ref('');

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/products', query: { q: searchQuery.value.trim() } });
  }
};
</script>

<template>
  <header class="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-neutral-950/80 border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      <!-- Left: Logo & Nav -->
      <div class="flex items-center gap-8">
        <NuxtLink to="/" class="flex items-center gap-2.5 group">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-primary-500/25 group-hover:scale-105 transition-transform">
            <UIcon name="i-lucide-zap" class="w-5 h-5 fill-current" />
          </div>
          <div class="flex flex-col">
            <span class="text-base font-extrabold tracking-tight text-neutral-900 dark:text-white">
              VOLT<span class="text-primary-500">.STORE</span>
            </span>
            <span class="text-[10px] font-mono -mt-1 text-neutral-400">HIGH-PERF HARDWARE</span>
          </div>
        </NuxtLink>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
          <NuxtLink
            to="/products"
            class="text-neutral-600 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400 transition"
            active-class="text-primary-600 dark:text-primary-400 font-semibold"
          >
            All Products
          </NuxtLink>
          <NuxtLink
            to="/#categories"
            class="text-neutral-600 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400 transition"
          >
            Categories
          </NuxtLink>
          <a
            href="http://localhost:3000/docs"
            target="_blank"
            class="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition"
          >
            <span>Scalar Docs</span>
            <UIcon name="i-lucide-external-link" class="w-3.5 h-3.5" />
          </a>
          <a
            href="http://localhost:3000/swagger"
            target="_blank"
            class="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition"
          >
            <span>Swagger</span>
            <UIcon name="i-lucide-external-link" class="w-3.5 h-3.5" />
          </a>
        </nav>
      </div>

      <!-- Center: Search bar -->
      <div class="hidden lg:flex flex-1 max-w-md mx-4">
        <form class="w-full relative" @submit.prevent="handleSearch">
          <UIcon name="i-lucide-search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search headphones, keyboards, laptops..."
            class="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/60 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition"
          />
        </form>
      </div>

      <!-- Right: Cart & Actions -->
      <div class="flex items-center gap-3">
        <UColorModeButton />

        <!-- Cart Button with Animated Badge -->
        <button
          class="relative flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
          aria-label="View shopping cart"
          @click="isDrawerOpen = true"
        >
          <UIcon name="i-lucide-shopping-cart" class="w-5 h-5" />
          <span
            v-if="cart.itemCount > 0"
            class="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-primary-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md animate-scale"
          >
            {{ cart.itemCount }}
          </span>
        </button>
      </div>
    </div>
  </header>
</template>
