<template>
  <div class="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
    <p class="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">Measure your workload</p>
    <h3 class="mt-2 text-xl font-bold text-neutral-950 dark:text-white">Reproduce the HTTP benchmarks</h3>
    <p class="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">The repository includes in-memory and localhost HTTP harnesses. Run them with the same routes, runtime versions, and load settings before comparing frameworks.</p>
    <CodeSnippet code="bun run bench:all" language="bash" filename="Repository root" />
    <NuxtLink to="/docs/benchmarks" class="text-sm font-semibold text-primary-600 underline underline-offset-4 dark:text-primary-400">Read the methodology and limitations →</NuxtLink>
  </div>
</template>
