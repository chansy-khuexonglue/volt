<script setup lang="ts">
useSeoMeta({
  title: 'Volt Plugins & Ecosystem',
  description: 'Explore official Volt plugins: Prisma ORM, Redis, PostgreSQL native driver, JWT, rate limiting, and GraphQL.',
});

interface PluginInfo {
  name: string;
  package: string;
  description: string;
  docSlug: string;
  icon: string;
  isOfficial?: boolean;
}

const plugins: PluginInfo[] = [
  {
    name: 'Prisma ORM Plugin',
    package: '@volt/plugin-prisma',
    description: 'Official Prisma Client integration with context store injection, automatic P2002/P2025 error code translation, and graceful connection teardown.',
    docSlug: 'plugin-prisma',
    icon: 'i-simple-icons-prisma',
    isOfficial: true,
  },
  {
    name: 'PostgreSQL Native',
    package: '@volt/plugin-postgres',
    description: 'Harnesses Bun\'s native SQL client for high-throughput tagged template queries and transaction support.',
    docSlug: 'plugin-postgres',
    icon: 'i-simple-icons-postgresql',
    isOfficial: true,
  },
  {
    name: 'Redis Cache',
    package: '@volt/plugin-redis',
    description: 'Redis client with pooled connections, response caching, key expiration, and session store helpers.',
    docSlug: 'plugin-redis',
    icon: 'i-simple-icons-redis',
    isOfficial: true,
  },
  {
    name: 'JWT Authentication',
    package: '@volt/plugin-jwt',
    description: 'Sign and verify JSON Web Tokens using HMAC-SHA256 with automatic Bearer token extraction and route guards.',
    docSlug: 'plugin-jwt',
    icon: 'i-lucide-shield-check',
    isOfficial: true,
  },
  {
    name: 'CORS & Security',
    package: '@volt/plugin-cors',
    description: 'Configurable Cross-Origin Resource Sharing middleware supporting credentials, dynamic origins, and preflights.',
    docSlug: 'plugin-cors',
    icon: 'i-lucide-lock',
    isOfficial: true,
  },
  {
    name: 'Rate Limiter',
    package: '@volt/plugin-rate-limit',
    description: 'Token bucket rate limiting to prevent DDoS, abuse, and brute force with standard RFC headers.',
    docSlug: 'plugin-rate-limit',
    icon: 'i-lucide-gauge',
    isOfficial: true,
  },
  {
    name: 'Signed Cookies',
    package: '@volt/plugin-cookies',
    description: 'Parse, serialize, and cryptographically sign HTTP cookies with HMAC integrity checks.',
    docSlug: 'plugin-cookies',
    icon: 'i-lucide-cookie',
    isOfficial: true,
  },
  {
    name: 'Structured Logger',
    package: '@volt/plugin-logger',
    description: 'Ultra-low overhead request logger with colorful dev formatting and single-line JSON for production.',
    docSlug: 'plugin-logger',
    icon: 'i-lucide-file-text',
    isOfficial: true,
  },
  {
    name: 'GraphQL Server',
    package: '@volt/plugin-graphql',
    description: 'Run GraphQL schemas natively in Volt with request context injection and embedded GraphiQL web IDE.',
    docSlug: 'plugin-graphql',
    icon: 'i-simple-icons-graphql',
    isOfficial: true,
  },
];
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
    <!-- Header -->
    <div class="space-y-3 max-w-2xl">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-mono font-bold uppercase tracking-wider border border-primary-500/20">
        <UIcon name="i-lucide-blocks" class="w-4 h-4 text-primary-500" />
        <span>Ecosystem Directory</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
        Official Plugins Ecosystem
      </h1>
      <p class="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
        Extend your Volt application with battle-tested, modular plugins. Zero bloat: only install what you need.
      </p>
    </div>

    <!-- Plugin Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="p in plugins"
        :key="p.package"
        class="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:border-primary-500/40 transition-all flex flex-col justify-between group space-y-4 font-mono"
      >
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-lg bg-neutral-900 text-white dark:bg-neutral-800 dark:text-primary-400 flex items-center justify-center font-bold">
              <UIcon :name="p.icon" class="w-5 h-5" />
            </div>
            <span
              v-if="p.isOfficial"
              class="text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-primary-500/10 text-primary-500 border border-primary-500/20"
            >
              Official
            </span>
          </div>

          <div>
            <h3 class="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors uppercase">
              {{ p.name }}
            </h3>
            <div class="text-[11px] text-neutral-400 mt-0.5">
              {{ p.package }}
            </div>
          </div>

          <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
            {{ p.description }}
          </p>
        </div>

        <div class="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
          <NuxtLink
            :to="`/docs/${p.docSlug}`"
            class="text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1 uppercase tracking-wider"
          >
            <span>Documentation</span>
            <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
