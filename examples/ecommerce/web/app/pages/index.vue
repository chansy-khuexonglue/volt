<script setup lang="ts">
const api = useApi();

// Fetch categories and featured products concurrently
const [{ data: categoriesData }, { data: featuredData }] = await Promise.all([
  useAsyncData('categories', () => api.getCategories()),
  useAsyncData('featured_products', () => api.getFeaturedProducts()),
]);

const categories = computed(() => categoriesData.value?.data || []);
const featuredProducts = computed(() => featuredData.value?.data || []);
</script>

<template>
  <div class="space-y-20 pb-16">
    <!-- Hero Banner -->
    <section class="relative overflow-hidden bg-gradient-to-b from-primary-50/50 via-white to-neutral-50/30 dark:from-primary-950/20 dark:via-neutral-950 dark:to-neutral-950 border-b border-neutral-200/80 dark:border-neutral-800/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
        <div class="max-w-3xl space-y-6">
          <!-- Performance badge -->
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60">
            <UIcon name="i-lucide-zap" class="w-3.5 h-3.5 fill-current animate-pulse text-amber-500" />
            <span>Volt API + Bun Native SQL • 0.2ms Latency</span>
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
            Engineering-Grade <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-400">
              Minimalist Hardware
            </span>
          </h1>

          <p class="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
            Curated acoustic monitors, ergonomic chairs, mechanical keyboards, and silicon workstations designed for builders, creators, and engineers.
          </p>

          <div class="flex flex-wrap items-center gap-4 pt-2">
            <UButton
              to="/products"
              color="primary"
              variant="solid"
              size="lg"
              icon="i-lucide-arrow-right"
              trailing
              class="rounded-xl px-6 py-3 font-semibold shadow-lg shadow-primary-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              Explore Catalog
            </UButton>
            <UButton
              to="#categories"
              color="neutral"
              variant="outline"
              size="lg"
              class="rounded-xl px-6 py-3 font-medium"
            >
              Browse Categories
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section id="categories" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div class="flex items-end justify-between mb-8">
        <div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            Shop by Category
          </h2>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Carefully curated collections for specialized setups
          </p>
        </div>
        <NuxtLink
          to="/products"
          class="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
        >
          View all <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5" />
        </NuxtLink>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.id"
          :to="`/products?category=${cat.id}`"
          class="group relative aspect-square rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-lg transition-all"
        >
          <img
            :src="cat.image_url"
            :alt="cat.name"
            class="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
            <span class="text-xs font-medium text-primary-300">
              {{ cat.item_count }} items
            </span>
            <h3 class="text-sm font-bold leading-tight group-hover:text-primary-300 transition-colors">
              {{ cat.name }}
            </h3>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Featured Products Grid -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-end justify-between mb-8">
        <div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            Featured Products
          </h2>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Top-rated and flagship selections from our live PostgreSQL catalog
          </p>
        </div>
        <NuxtLink
          to="/products"
          class="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
        >
          Explore All <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5" />
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in featuredProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </section>

    <!-- Perks / Trust Highlights -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 rounded-3xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
            <UIcon name="i-lucide-truck" class="w-6 h-6" />
          </div>
          <div>
            <h4 class="font-bold text-sm text-neutral-900 dark:text-white">Free Express Shipping</h4>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Complimentary FedEx / DHL express shipping on all orders over $150.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
            <UIcon name="i-lucide-shield-check" class="w-6 h-6" />
          </div>
          <div>
            <h4 class="font-bold text-sm text-neutral-900 dark:text-white">Authentic Warranty</h4>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              100% genuine manufacturer guarantee with up to 12-year hardware coverage.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
            <UIcon name="i-lucide-refresh-cw" class="w-6 h-6" />
          </div>
          <div>
            <h4 class="font-bold text-sm text-neutral-900 dark:text-white">30-Day Hassle-Free Returns</h4>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Test your gear in your own workspace. Full refund if not completely satisfied.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
