<template>
  <footer class="mt-24 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <!-- Brand Info -->
        <div class="space-y-4 md:col-span-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
              <UIcon name="i-lucide-zap" class="w-4 h-4 fill-current" />
            </div>
            <span class="text-lg font-bold text-neutral-900 dark:text-white">VOLT STORE</span>
          </div>
          <p class="text-sm max-w-sm leading-relaxed text-neutral-500">
            A production-ready e-commerce experience showcasing the power and raw speed of
            the <strong>Volt</strong> web framework for Bun paired with <strong>Nuxt UI</strong> and <strong>PostgreSQL</strong>.
          </p>
          <div class="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span class="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800">Volt API v0.1</span>
            <span class="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800">Bun Native SQL</span>
            <span class="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800">Nuxt 4</span>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
            Storefront
          </h4>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/products" class="hover:text-primary-500 transition">All Products</NuxtLink></li>
            <li><NuxtLink to="/cart" class="hover:text-primary-500 transition">Shopping Cart</NuxtLink></li>
            <li><NuxtLink to="/checkout" class="hover:text-primary-500 transition">Checkout</NuxtLink></li>
          </ul>
        </div>

        <!-- API Links -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
            Developer API
          </h4>
          <ul class="space-y-2 text-sm">
            <li><a href="http://localhost:3000/docs" target="_blank" class="hover:text-primary-500 transition">Scalar Reference</a></li>
            <li><a href="http://localhost:3000/swagger" target="_blank" class="hover:text-primary-500 transition">Swagger UI</a></li>
            <li><a href="http://localhost:3000/openapi.json" target="_blank" class="hover:text-primary-500 transition">OpenAPI JSON</a></li>
            <li><a href="http://localhost:3000/health" target="_blank" class="hover:text-primary-500 transition">Health Status</a></li>
          </ul>
        </div>
      </div>

      <div class="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <p>© {{ new Date().getFullYear() }} Volt Storefront. Built for extreme performance.</p>
        <div class="flex items-center gap-6">
          <a href="https://github.com/chansy-khuexonglue/volt" target="_blank" class="hover:text-primary-500 transition flex items-center gap-1">
            <UIcon name="i-simple-icons-github" class="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
