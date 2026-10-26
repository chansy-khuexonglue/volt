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
  <!-- Top Ticker / Telemetry Header -->
  <div class="w-full bg-neutral-900 text-neutral-300 dark:bg-black dark:text-neutral-400 text-[11px] font-mono border-b border-neutral-800 py-1.5 overflow-hidden">
    <div class="animate-ticker whitespace-nowrap flex items-center gap-8">
      <span class="inline-flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span class="text-white font-semibold">VOLT HYPERTHROUGHPUT ENGINE</span>
        <span class="text-neutral-500">//</span>
        <span>0.18MS P99 LATENCY</span>
      </span>
      <span class="text-neutral-600">■</span>
      <span>100% POSTGRESQL ACID COMPLIANT</span>
      <span class="text-neutral-600">■</span>
      <span>SAME-DAY GLOBAL PRIORITY DISPATCH (FEDEX / DHL EXPRESS)</span>
      <span class="text-neutral-600">■</span>
      <span class="text-primary-400">AUTHENTIC 12-YEAR ARCHIVAL HARDWARE WARRANTY</span>
      <span class="text-neutral-600">■</span>
      <span>REAL-TIME VOLT CONTEXT STORE & WEBSOCKET SYNC</span>
      <span class="text-neutral-600">■</span>
      <!-- Duplicate for seamless looping -->
      <span class="inline-flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span class="text-white font-semibold">VOLT HYPERTHROUGHPUT ENGINE</span>
        <span class="text-neutral-500">//</span>
        <span>0.18MS P99 LATENCY</span>
      </span>
      <span class="text-neutral-600">■</span>
      <span>100% POSTGRESQL ACID COMPLIANT</span>
      <span class="text-neutral-600">■</span>
      <span>SAME-DAY GLOBAL PRIORITY DISPATCH (FEDEX / DHL EXPRESS)</span>
      <span class="text-neutral-600">■</span>
      <span class="text-primary-400">AUTHENTIC 12-YEAR ARCHIVAL HARDWARE WARRANTY</span>
      <span class="text-neutral-600">■</span>
      <span>REAL-TIME VOLT CONTEXT STORE & WEBSOCKET SYNC</span>
    </div>
  </div>

  <!-- Primary Floating Navigation Bar -->
  <header class="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 dark:bg-neutral-950/85 border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
      
      <!-- Brand & Architectural Monogram -->
      <NuxtLink to="/" class="flex items-center gap-3 group shrink-0">
        <div class="w-8 h-8 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center font-mono font-black text-sm tracking-tighter shadow-sm group-hover:bg-primary-500 group-hover:text-white transition-colors duration-200">
          V⚡
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5">
            <span class="text-sm font-extrabold tracking-tight text-neutral-900 dark:text-white">
              VOLT
            </span>
            <span class="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60">
              ARCHIVE
            </span>
          </div>
          <span class="text-[9px] font-mono text-neutral-400 tracking-wider uppercase -mt-0.5">
            Hardware Division
          </span>
        </div>
      </NuxtLink>

      <!-- Navigation Links (Swiss Editorial Style) -->
      <nav class="hidden md:flex items-center gap-1 text-xs font-mono font-medium">
        <NuxtLink
          to="/products"
          class="px-3 py-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          active-class="text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-900 font-bold"
        >
          [ CATALOG ]
        </NuxtLink>
        <NuxtLink
          to="/#categories"
          class="px-3 py-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
        >
          [ DEPARTMENTS ]
        </NuxtLink>
        <a
          href="http://localhost:3000/docs"
          target="_blank"
          class="px-3 py-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors inline-flex items-center gap-1.5"
        >
          <span>API SPEC</span>
          <UIcon name="i-lucide-arrow-up-right" class="w-3 h-3 text-neutral-400" />
        </a>
      </nav>

      <!-- Search Box with Terminal Aesthetic -->
      <div class="hidden lg:flex flex-1 max-w-sm">
        <form class="w-full relative" @submit.prevent="handleSearch">
          <UIcon name="i-lucide-search" class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search synthesizer, keyboard, optics..."
            class="w-full pl-8 pr-12 py-1.5 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition"
          />
          <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-400">
            ↵
          </span>
        </form>
      </div>

      <!-- Right Controls: Color Mode & Tactile Cart Pill -->
      <div class="flex items-center gap-2.5">
        <UColorModeButton class="rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900" />

        <!-- Tactile Cart Button -->
        <button
          class="group relative flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-neutral-900 dark:border-neutral-700 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-primary-600 dark:hover:bg-neutral-200 transition-all font-mono text-xs"
          aria-label="View shopping cart"
          @click="isDrawerOpen = true"
        >
          <UIcon name="i-lucide-shopping-bag" class="w-4 h-4 text-primary-400 dark:text-primary-600 group-hover:text-white" />
          <span class="font-bold">
            CART
          </span>
          <span class="px-1.5 py-0.2 rounded bg-neutral-800 dark:bg-neutral-200 text-primary-300 dark:text-neutral-900 font-bold text-[11px]">
            {{ cart.itemCount }}
          </span>
          <span v-if="cart.subtotal > 0" class="hidden sm:inline border-l border-neutral-700 dark:border-neutral-300 pl-2 text-neutral-300 dark:text-neutral-700 font-medium text-[11px]">
            ${{ cart.subtotal.toFixed(0) }}
          </span>
        </button>
      </div>

    </div>
  </header>
</template>
