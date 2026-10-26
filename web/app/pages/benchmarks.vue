<script setup lang="ts">
import { docsDatabase } from '../composables/useDocsData';
const doc = docsDatabase.benchmarks!;
useSeoMeta({ title: 'Volt Benchmark Methodology', description: doc.description });
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6">
    <div class="space-y-4">
      <p class="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">Performance reference</p>
      <h1 class="text-3xl font-bold text-neutral-950 dark:text-white">Benchmarks you can reproduce</h1>
      <p class="text-neutral-600 dark:text-neutral-400">Compare equivalent work and publish the environment and raw results with every measurement. This page provides the checked-in commands and their scope; it does not report live telemetry.</p>
    </div>
    <DocsContent :content="doc.content" />
    <NuxtLink to="/docs/framework-comparison" class="inline-block text-primary-600 underline dark:text-primary-400">Compare framework APIs and learning paths →</NuxtLink>
  </div>
</template>
