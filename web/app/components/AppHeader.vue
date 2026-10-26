<script setup lang="ts">
import { useSearch } from '../composables/useSearch';

const { openSearch } = useSearch();
const isMobileMenuOpen = ref(false);
const route = useRoute();

watch(() => route.path, () => {
  isMobileMenuOpen.value = false;
});
</script>

<template>
  <div>
    <!-- Top Telemetry Marquee Ticker -->
    <div class="w-full bg-neutral-900 text-neutral-300 dark:bg-black dark:text-neutral-400 text-[11px] font-mono border-b border-neutral-800 py-1.5 overflow-hidden select-none">
      <div class="animate-ticker whitespace-nowrap flex items-center gap-8">
        <span class="inline-flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span class="text-white font-semibold">VOLT HYPERTHROUGHPUT ENGINE</span>
          <span class="text-neutral-500">//</span>
          <span class="text-primary-400">184,210 REQ/SEC</span>
        </span>
        <span class="text-neutral-600">■</span>
        <span>0.18MS P99 TAIL LATENCY</span>
        <span class="text-neutral-600">■</span>
        <span>BUN 1.1 C++ NATIVE HTTP CORE</span>
        <span class="text-neutral-600">■</span>
        <span class="text-primary-400">OFFICIAL PRISMA ORM PLUGIN (@volt/plugin-prisma)</span>
        <span class="text-neutral-600">■</span>
        <span>ZERO-ALLOCATION RADIX TREE ROUTER</span>
        <span class="text-neutral-600">■</span>
        <span>ENTERPRISE INVERSION OF CONTROL (DI) CONTAINER</span>
        <span class="text-neutral-600">■</span>
        <!-- Duplicate for seamless infinite loop -->
        <span class="inline-flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span class="text-white font-semibold">VOLT HYPERTHROUGHPUT ENGINE</span>
          <span class="text-neutral-500">//</span>
          <span class="text-primary-400">184,210 REQ/SEC</span>
        </span>
        <span class="text-neutral-600">■</span>
        <span>0.18MS P99 TAIL LATENCY</span>
        <span class="text-neutral-600">■</span>
        <span>BUN 1.1 C++ NATIVE HTTP CORE</span>
        <span class="text-neutral-600">■</span>
        <span class="text-primary-400">OFFICIAL PRISMA ORM PLUGIN (@volt/plugin-prisma)</span>
        <span class="text-neutral-600">■</span>
        <span>ZERO-ALLOCATION RADIX TREE ROUTER</span>
        <span class="text-neutral-600">■</span>
        <span>ENTERPRISE INVERSION OF CONTROL (DI) CONTAINER</span>
      </div>
    </div>

    <!-- Primary Floating Navigation Bar -->
    <header class="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 dark:bg-neutral-950/85 border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        <!-- Left: Logo & Navigation Links -->
        <div class="flex items-center gap-8">
          <NuxtLink to="/" class="shrink-0">
            <VoltLogo />
          </NuxtLink>

          <nav class="hidden md:flex items-center gap-6 text-xs font-mono font-medium tracking-wide uppercase">
            <NuxtLink
              to="/docs/introduction"
              class="transition-colors hover:text-primary-500"
              :class="route.path.startsWith('/docs') ? 'text-primary-500 font-bold' : 'text-neutral-600 dark:text-neutral-400'"
            >
              Docs
            </NuxtLink>
            <NuxtLink
              to="/benchmarks"
              class="transition-colors hover:text-primary-500"
              :class="route.path.startsWith('/benchmarks') ? 'text-primary-500 font-bold' : 'text-neutral-600 dark:text-neutral-400'"
            >
              Benchmarks
            </NuxtLink>
            <NuxtLink
              to="/playground"
              class="transition-colors hover:text-primary-500"
              :class="route.path.startsWith('/playground') ? 'text-primary-500 font-bold' : 'text-neutral-600 dark:text-neutral-400'"
            >
              Sandbox
            </NuxtLink>
            <NuxtLink
              to="/ecosystem"
              class="transition-colors hover:text-primary-500"
              :class="route.path.startsWith('/ecosystem') ? 'text-primary-500 font-bold' : 'text-neutral-600 dark:text-neutral-400'"
            >
              Ecosystem
            </NuxtLink>
          </nav>
        </div>

        <!-- Right: Search, Socials, Theme Toggle -->
        <div class="flex items-center gap-3">
          <!-- Quick Search Button -->
          <button
            @click="openSearch"
            class="flex items-center gap-3 px-3.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/70 text-xs font-mono text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group shadow-sm"
          >
            <UIcon name="i-lucide-search" class="w-3.5 h-3.5 text-neutral-400 group-hover:text-primary-500 transition-colors" />
            <span class="hidden sm:inline">Search docs...</span>
            <kbd class="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-200/80 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700">
              ⌘K
            </kbd>
          </button>

          <!-- GitHub Repo -->
          <a
            href="https://github.com/chansy-khuexonglue/volt"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1.5 p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            title="GitHub Repository"
          >
            <UIcon name="i-simple-icons-github" class="w-4 h-4" />
          </a>

          <!-- Color Mode Toggle -->
          <UColorModeButton />

          <!-- Mobile Menu Trigger -->
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <UIcon :name="isMobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Mobile Drawer -->
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white/98 dark:bg-neutral-950/98 px-6 py-4 space-y-3 font-mono text-xs uppercase"
      >
        <NuxtLink to="/docs/introduction" class="block py-2 font-medium hover:text-primary-500">
          Documentation
        </NuxtLink>
        <NuxtLink to="/benchmarks" class="block py-2 font-medium hover:text-primary-500">
          Benchmarks
        </NuxtLink>
        <NuxtLink to="/playground" class="block py-2 font-medium hover:text-primary-500">
          Sandbox
        </NuxtLink>
        <NuxtLink to="/ecosystem" class="block py-2 font-medium hover:text-primary-500">
          Ecosystem
        </NuxtLink>
        <div class="pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <a
            href="https://github.com/chansy-khuexonglue/volt"
            target="_blank"
            class="flex items-center gap-2 py-2 font-medium text-primary-500"
          >
            <UIcon name="i-simple-icons-github" class="w-4 h-4" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </div>

      <!-- Search modal instance -->
      <SearchModal />
    </header>
  </div>
</template>
