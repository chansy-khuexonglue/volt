<script setup lang="ts">
useSeoMeta({
  title: 'Volt Interactive API Playground & Sandbox',
  description: 'Test live Volt API endpoints, query parameters, headers, and responses in real time.',
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
    <div class="space-y-3 max-w-2xl">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 text-xs font-mono font-semibold">
        <UIcon name="i-lucide-play" class="w-3.5 h-3.5 fill-current" />
        <span>Live Interactive Testing</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
        Interactive API Sandbox
      </h1>
      <p class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        Execute real-time requests against Volt's core HTTP engine, test query type coercion, review status codes, and examine response timings.
      </p>
    </div>

    <!-- Playground Component -->
    <ApiPlayground />
  </div>
</template>
