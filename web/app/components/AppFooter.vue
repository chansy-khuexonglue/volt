<template>
  <footer class="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-black text-neutral-600 dark:text-neutral-400 text-xs font-mono transition-colors">
    <!-- Main Footer Columns -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-10">
        <!-- Brand Info -->
        <div class="md:col-span-2 space-y-4">
          <VoltLogo />
          <p class="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm leading-relaxed font-sans">
            High-performance, TypeScript-first API framework built specifically for Bun. Explore practical guides, complete examples, and current API limitations.
          </p>
          <div class="flex items-center gap-3 pt-1">
            <a
              href="https://github.com/chansy-khuexonglue/volt"
              target="_blank"
              class="w-7 h-7 rounded flex items-center justify-center bg-neutral-200/80 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:text-primary-500 hover:bg-neutral-200 transition-colors"
            >
              <UIcon name="i-simple-icons-github" class="w-3.5 h-3.5" />
            </a>
            <a
              href="https://bun.sh"
              target="_blank"
              class="w-7 h-7 rounded flex items-center justify-center bg-neutral-200/80 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:text-primary-500 hover:bg-neutral-200 transition-colors"
            >
              <UIcon name="i-simple-icons-bun" class="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <!-- Col 1: Documentation -->
        <div class="space-y-3">
          <h4 class="text-[11px] font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            Documentation
          </h4>
          <ul class="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
            <li><NuxtLink to="/docs/introduction" class="hover:text-primary-500 transition-colors">Introduction</NuxtLink></li>
            <li><NuxtLink to="/docs/quick-start" class="hover:text-primary-500 transition-colors">Quick Start</NuxtLink></li>
            <li><NuxtLink to="/docs/router" class="hover:text-primary-500 transition-colors">Radix Router</NuxtLink></li>
            <li><NuxtLink to="/docs/schema-validation" class="hover:text-primary-500 transition-colors">Validation</NuxtLink></li>
            <li><NuxtLink to="/docs/openapi" class="hover:text-primary-500 transition-colors">OpenAPI</NuxtLink></li>
          </ul>
        </div>

        <!-- Col 2: Plugins Ecosystem -->
        <div class="space-y-3">
          <h4 class="text-[11px] font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            Plugins
          </h4>
          <ul class="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
            <li><NuxtLink to="/docs/plugin-prisma" class="hover:text-primary-500 transition-colors">Prisma ORM</NuxtLink></li>
            <li><NuxtLink to="/docs/plugin-postgres" class="hover:text-primary-500 transition-colors">PostgreSQL Integration</NuxtLink></li>
            <li><NuxtLink to="/docs/plugin-redis" class="hover:text-primary-500 transition-colors">Redis Cache</NuxtLink></li>
            <li><NuxtLink to="/docs/plugin-jwt" class="hover:text-primary-500 transition-colors">JWT Security</NuxtLink></li>
            <li><NuxtLink to="/docs/plugin-graphql" class="hover:text-primary-500 transition-colors">GraphQL Server</NuxtLink></li>
          </ul>
        </div>

        <!-- Col 3: Resources -->
        <div class="space-y-3">
          <h4 class="text-[11px] font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            Resources
          </h4>
          <ul class="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
            <li><NuxtLink to="/benchmarks" class="hover:text-primary-500 transition-colors">Benchmarks</NuxtLink></li>
            <li><NuxtLink to="/playground" class="hover:text-primary-500 transition-colors">Response Examples</NuxtLink></li>
            <li><NuxtLink to="/ecosystem" class="hover:text-primary-500 transition-colors">All Packages</NuxtLink></li>
            <li><a href="https://github.com/chansy-khuexonglue/volt/releases" target="_blank" class="hover:text-primary-500 transition-colors">Releases</a></li>
            <li><a href="https://github.com/chansy-khuexonglue/volt/blob/main/LICENSE" target="_blank" class="hover:text-primary-500 transition-colors">MIT License</a></li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="mt-10 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
        <p>© {{ new Date().getFullYear() }} VOLT FRAMEWORK ARCHITECTURE. RELEASED UNDER MIT LICENSE.</p>
        <p class="flex items-center gap-2">
          <span>ENGINEERED FOR BUN</span>
          <span class="text-neutral-400 dark:text-neutral-600">■</span>
          <span class="text-primary-500 font-bold">100% OPEN SOURCE</span>
        </p>
      </div>
    </div>
  </footer>
</template>
