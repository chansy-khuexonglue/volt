<script setup lang="ts">
useSeoMeta({
  title: 'Volt API Response Examples',
  description: 'Explore preset HTTP request and response examples and continue to runnable API tutorials.',
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
    <div class="space-y-3 max-w-2xl">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-mono font-bold uppercase tracking-wider border border-primary-500/20">
        <UIcon name="i-lucide-play" class="w-3.5 h-3.5 fill-current" />
        <span>Preset API Examples</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
        Interactive API Sandbox
      </h1>
      <p class="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
        Explore example status codes and JSON payloads. These presets run in the browser; use the tutorials to start a real Volt server and test its behavior.
      </p>
    </div>

    <!-- Playground Component -->
    <ApiPlayground />
  </div>
</template>
