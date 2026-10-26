<template>
  <footer class="mt-24 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-600 dark:text-neutral-400">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      <!-- Architectural Colophon Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-neutral-200 dark:border-neutral-800">
        
        <!-- Left Brand & Architecture Specs -->
        <div class="md:col-span-5 space-y-4">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center font-mono font-black text-xs">
              V⚡
            </div>
            <span class="text-sm font-black tracking-tight text-neutral-900 dark:text-white uppercase">
              VOLT ARCHIVE // HARDWARE
            </span>
          </div>

          <p class="text-xs text-neutral-500 leading-relaxed max-w-sm font-sans">
            A production reference storefront demonstrating extreme latency performance, built on the <strong>Volt</strong> web framework for Bun with <strong>PostgreSQL</strong> native drivers and <strong>Nuxt 4</strong>.
          </p>

          <!-- Technical Specs Pill Matrix -->
          <div class="flex flex-wrap gap-1.5 pt-2 font-mono text-[10px]">
            <span class="px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500">
              FRAMEWORK: VOLT TS
            </span>
            <span class="px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500">
              ENGINE: BUN 1.4
            </span>
            <span class="px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500">
              DB: POSTGRESQL 16
            </span>
            <span class="px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500">
              LATENCY: &lt;0.2MS
            </span>
          </div>
        </div>

        <!-- Middle: Hardware Departments -->
        <div class="md:col-span-3 space-y-3 font-mono">
          <h4 class="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            // HARDWARE INDEX
          </h4>
          <ul class="space-y-2 text-xs">
            <li>
              <NuxtLink to="/products?category=cat-audio" class="hover:text-primary-500 transition-colors">
                [ 01 ] SMART AUDIO &amp; HI-FI
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/products?category=cat-workspace" class="hover:text-primary-500 transition-colors">
                [ 02 ] MINIMAL WORKSPACE
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/products?category=cat-computing" class="hover:text-primary-500 transition-colors">
                [ 03 ] SILICON LAPTOPS
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/products?category=cat-photography" class="hover:text-primary-500 transition-colors">
                [ 04 ] OPTICS &amp; CAMERAS
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/products?category=cat-bags" class="hover:text-primary-500 transition-colors">
                [ 05 ] TECHNICAL CARRY
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Right: Developer Specs -->
        <div class="md:col-span-4 space-y-3 font-mono">
          <h4 class="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            // API TELEMETRY &amp; DOCS
          </h4>
          <ul class="space-y-2 text-xs">
            <li>
              <a href="http://localhost:3000/docs" target="_blank" class="hover:text-primary-500 transition-colors inline-flex items-center gap-1.5">
                <span>SCALAR API SPECIFICATION</span>
                <UIcon name="i-lucide-arrow-up-right" class="w-3 h-3 text-neutral-400" />
              </a>
            </li>
            <li>
              <a href="http://localhost:3000/swagger" target="_blank" class="hover:text-primary-500 transition-colors inline-flex items-center gap-1.5">
                <span>OPENAPI 3.1 SCHEMA</span>
                <UIcon name="i-lucide-arrow-up-right" class="w-3 h-3 text-neutral-400" />
              </a>
            </li>
            <li>
              <a href="http://localhost:3000/health" target="_blank" class="hover:text-primary-500 transition-colors inline-flex items-center gap-1.5">
                <span>LIVE SERVER HEALTH</span>
                <UIcon name="i-lucide-arrow-up-right" class="w-3 h-3 text-neutral-400" />
              </a>
            </li>
            <li>
              <a href="https://github.com/chansy-khuexonglue/volt" target="_blank" class="hover:text-primary-500 transition-colors inline-flex items-center gap-1.5">
                <span>GITHUB MONOREPO</span>
                <UIcon name="i-lucide-arrow-up-right" class="w-3 h-3 text-neutral-400" />
              </a>
            </li>
          </ul>
        </div>

      </div>

      <!-- Bottom Bar -->
      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-400">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>PRODUCTION CLUSTER ONLINE // ALL SERVICES HEALTHY</span>
        </div>
        <p>© 2026 VOLT FRAMEWORK. ARCHIVAL HARDWARE DIVISION.</p>
      </div>

    </div>
  </footer>
</template>
