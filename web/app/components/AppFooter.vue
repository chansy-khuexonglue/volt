<template>
  <footer class="border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/50 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-10">
        <!-- Brand Info -->
        <div class="md:col-span-2 space-y-4">
          <VoltLogo />
          <p class="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">
            High-performance, TypeScript-first API framework built specifically for Bun. Designed for maximum throughput, zero runtime overhead, and pleasant developer ergonomics.
          </p>
          <div class="flex items-center gap-3 pt-2">
            <a
              href="https://github.com/chansy-khuexonglue/volt"
              target="_blank"
              class="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-200/60 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-cyan-500 hover:bg-zinc-200 transition-colors"
            >
              <UIcon name="i-simple-icons-github" class="w-4 h-4" />
            </a>
            <a
              href="https://bun.sh"
              target="_blank"
              class="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-200/60 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-cyan-500 hover:bg-zinc-200 transition-colors"
            >
              <UIcon name="i-simple-icons-bun" class="w-4 h-4" />
            </a>
          </div>
        </div>

        <!-- Col 1: Documentation -->
        <div class="space-y-3">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Documentation
          </h4>
          <ul class="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li><NuxtLink to="/docs/introduction" class="hover:text-cyan-500 transition-colors">Introduction</NuxtLink></li>
            <li><NuxtLink to="/docs/quick-start" class="hover:text-cyan-500 transition-colors">Quick Start</NuxtLink></li>
            <li><NuxtLink to="/docs/router" class="hover:text-cyan-500 transition-colors">Radix Router</NuxtLink></li>
            <li><NuxtLink to="/docs/schema-validation" class="hover:text-cyan-500 transition-colors">Validation</NuxtLink></li>
            <li><NuxtLink to="/docs/openapi" class="hover:text-cyan-500 transition-colors">OpenAPI 3.1</NuxtLink></li>
          </ul>
        </div>

        <!-- Col 2: Plugins Ecosystem -->
        <div class="space-y-3">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Plugins
          </h4>
          <ul class="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li><NuxtLink to="/docs/plugin-prisma" class="hover:text-cyan-500 transition-colors">Prisma ORM</NuxtLink></li>
            <li><NuxtLink to="/docs/plugin-postgres" class="hover:text-cyan-500 transition-colors">PostgreSQL Native</NuxtLink></li>
            <li><NuxtLink to="/docs/plugin-redis" class="hover:text-cyan-500 transition-colors">Redis Cache</NuxtLink></li>
            <li><NuxtLink to="/docs/plugin-jwt" class="hover:text-cyan-500 transition-colors">JWT Security</NuxtLink></li>
            <li><NuxtLink to="/docs/plugin-graphql" class="hover:text-cyan-500 transition-colors">GraphQL Server</NuxtLink></li>
          </ul>
        </div>

        <!-- Col 3: Resources -->
        <div class="space-y-3">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Resources
          </h4>
          <ul class="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li><NuxtLink to="/benchmarks" class="hover:text-cyan-500 transition-colors">Benchmarks</NuxtLink></li>
            <li><NuxtLink to="/playground" class="hover:text-cyan-500 transition-colors">Live Playground</NuxtLink></li>
            <li><NuxtLink to="/ecosystem" class="hover:text-cyan-500 transition-colors">All Packages</NuxtLink></li>
            <li><a href="https://github.com/chansy-khuexonglue/volt/releases" target="_blank" class="hover:text-cyan-500 transition-colors">Releases</a></li>
            <li><a href="https://github.com/chansy-khuexonglue/volt/blob/main/LICENSE" target="_blank" class="hover:text-cyan-500 transition-colors">MIT License</a></li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-500">
        <p>© {{ new Date().getFullYear() }} Volt Framework. Released under the MIT License.</p>
        <p class="flex items-center gap-1.5 font-mono">
          <span>Engineered for Bun</span>
          <span class="text-zinc-400">•</span>
          <span>Zero Runtime Overhead</span>
        </p>
      </div>
    </div>
  </footer>
</template>
