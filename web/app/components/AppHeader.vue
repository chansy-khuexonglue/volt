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
  <header class="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      <!-- Left: Logo & primary links -->
      <div class="flex items-center gap-8">
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <VoltLogo />
        </NuxtLink>

        <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
          <NuxtLink
            to="/docs/introduction"
            class="transition-colors hover:text-cyan-500"
            :class="route.path.startsWith('/docs') ? 'text-cyan-500 font-semibold' : 'text-zinc-600 dark:text-zinc-400'"
          >
            Documentation
          </NuxtLink>
          <NuxtLink
            to="/benchmarks"
            class="transition-colors hover:text-cyan-500"
            :class="route.path === '/benchmarks' ? 'text-cyan-500 font-semibold' : 'text-zinc-600 dark:text-zinc-400'"
          >
            Benchmarks
          </NuxtLink>
          <NuxtLink
            to="/playground"
            class="transition-colors hover:text-cyan-500"
            :class="route.path === '/playground' ? 'text-cyan-500 font-semibold' : 'text-zinc-600 dark:text-zinc-400'"
          >
            Playground
          </NuxtLink>
          <NuxtLink
            to="/ecosystem"
            class="transition-colors hover:text-cyan-500"
            :class="route.path === '/ecosystem' ? 'text-cyan-500 font-semibold' : 'text-zinc-600 dark:text-zinc-400'"
          >
            Ecosystem
          </NuxtLink>
        </nav>
      </div>

      <!-- Right: Search, Socials, Theme Toggle -->
      <div class="flex items-center gap-3">
        <!-- Search Trigger -->
        <button
          @click="openSearch"
          class="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/70 dark:bg-zinc-900/70 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all font-sans group shadow-sm"
        >
          <UIcon name="i-lucide-search" class="w-4 h-4 text-zinc-400 group-hover:text-cyan-500 transition-colors" />
          <span class="hidden sm:inline">Search docs...</span>
          <kbd class="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
            ⌘K
          </kbd>
        </button>

        <!-- GitHub Repo Link -->
        <a
          href="https://github.com/chansy-khuexonglue/volt"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="GitHub Repository"
        >
          <UIcon name="i-simple-icons-github" class="w-5 h-5" />
        </a>

        <!-- Dark / Light Mode Switcher -->
        <UColorModeButton />

        <!-- Mobile Menu Trigger -->
        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <UIcon :name="isMobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Mobile Drawer -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 px-6 py-4 space-y-3"
    >
      <NuxtLink to="/docs/introduction" class="block py-2 text-sm font-medium hover:text-cyan-500">
        Documentation
      </NuxtLink>
      <NuxtLink to="/benchmarks" class="block py-2 text-sm font-medium hover:text-cyan-500">
        Benchmarks
      </NuxtLink>
      <NuxtLink to="/playground" class="block py-2 text-sm font-medium hover:text-cyan-500">
        Playground
      </NuxtLink>
      <NuxtLink to="/ecosystem" class="block py-2 text-sm font-medium hover:text-cyan-500">
        Ecosystem
      </NuxtLink>
      <div class="pt-2 border-t border-zinc-200 dark:border-zinc-800">
        <a
          href="https://github.com/chansy-khuexonglue/volt"
          target="_blank"
          class="flex items-center gap-2 py-2 text-sm font-medium text-cyan-500"
        >
          <UIcon name="i-simple-icons-github" class="w-4 h-4" />
          <span>Star on GitHub</span>
        </a>
      </div>
    </div>

    <!-- Search modal instance -->
    <SearchModal />
  </header>
</template>
