<script setup lang="ts">
const api = useApi();
const { addItem } = useCart();

const { data: categoriesData, refresh: refreshCategories } = await useAsyncData('home_categories', () => api.getCategories());
const { data: featuredData, refresh: refreshFeatured } = await useAsyncData('home_featured_products', () => api.getFeaturedProducts());

const categories = computed(() => categoriesData.value?.data || []);
const featuredProducts = computed(() => featuredData.value?.data || []);

const spotlightProduct = computed(() => {
  return featuredProducts.value.find((p: any) => p.id === 'prod-teenage-op1') || featuredProducts.value[0];
});

const isSpotlightAdding = ref(false);
const isSpotlightAdded = ref(false);

const handleSpotlightAdd = async () => {
  if (!spotlightProduct.value) return;
  try {
    isSpotlightAdding.value = true;
    await addItem(spotlightProduct.value.id, 1);
    isSpotlightAdded.value = true;
    setTimeout(() => {
      isSpotlightAdded.value = false;
    }, 2500);
  } finally {
    isSpotlightAdding.value = false;
  }
};

onMounted(() => {
  if (categories.value.length === 0) refreshCategories();
  if (featuredProducts.value.length === 0) refreshFeatured();
});
</script>

<template>
  <div class="space-y-16 lg:space-y-24 pb-20">
    
    <!-- Hero Section: The Industrial Masterstage -->
    <section class="relative border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/60 overflow-hidden tech-grid">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <!-- Left Column: Manifesto & Specifications -->
          <div class="lg:col-span-7 space-y-8">
            <!-- Micro Technical Stamp -->
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-[11px] font-mono text-neutral-600 dark:text-neutral-300 shadow-2xs">
              <span class="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
              <span class="font-bold text-neutral-900 dark:text-white">SPEC // VOLT ARCHIVE 2026</span>
              <span class="text-neutral-400">|</span>
              <span class="text-neutral-500">LIVE POSTGRESQL CATALOG</span>
            </div>

            <!-- Swiss Editorial Typography -->
            <div class="space-y-3">
              <h1 class="text-4xl sm:text-6xl font-black tracking-tight text-neutral-950 dark:text-white leading-[1.05] uppercase">
                Hardware For The Obsessive Craft.
              </h1>
              <p class="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl font-normal">
                Curated acoustic monitors, precision mechanical keyboards, 60MP rangefinders, and silicon workstations. Designed for builders, developers, and engineers.
              </p>
            </div>

            <!-- Action Cluster -->
            <div class="flex flex-wrap items-center gap-3 pt-1">
              <NuxtLink
                to="/products"
                class="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-mono text-xs font-bold hover:bg-primary-600 dark:hover:bg-neutral-200 transition-all shadow-sm active:scale-95"
              >
                <span>EXPLORE ARCHIVE</span>
                <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
              </NuxtLink>

              <NuxtLink
                to="/#categories"
                class="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 font-mono text-xs font-semibold hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
              >
                <span>DEPARTMENTS</span>
              </NuxtLink>
            </div>

            <!-- Real-time Hardware Telemetry Bar -->
            <div class="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80 max-w-lg font-mono">
              <div>
                <span class="text-[10px] text-neutral-400 uppercase tracking-wider block">Latency (P99)</span>
                <span class="text-lg font-bold text-neutral-900 dark:text-white">0.18 ms</span>
              </div>
              <div>
                <span class="text-[10px] text-neutral-400 uppercase tracking-wider block">Engine</span>
                <span class="text-lg font-bold text-neutral-900 dark:text-white">Volt / Bun</span>
              </div>
              <div>
                <span class="text-[10px] text-neutral-400 uppercase tracking-wider block">Database</span>
                <span class="text-lg font-bold text-neutral-900 dark:text-white">Postgres 16</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Flagship Spotlight Card -->
          <div v-if="spotlightProduct" class="lg:col-span-5">
            <div class="relative bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-2xl p-6 shadow-xl space-y-5">
              
              <!-- Spotlight Header -->
              <div class="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-primary-500" />
                  <span class="text-[11px] font-mono font-bold tracking-wider uppercase text-neutral-500">
                    FLAGSHIP SPOTLIGHT
                  </span>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold border border-neutral-200 dark:border-neutral-700">
                  {{ spotlightProduct.badge || 'PRO SPEC' }}
                </span>
              </div>

              <!-- Visual Stage -->
              <NuxtLink :to="`/products/${spotlightProduct.id}`" class="block aspect-[16/10] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-950 relative group">
                <img
                  :src="spotlightProduct.images[0]"
                  :alt="spotlightProduct.title"
                  class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                  <span class="text-xs font-mono text-white/90">
                    Tap to inspect full teardown & specs →
                  </span>
                </div>
              </NuxtLink>

              <!-- Item Info -->
              <div class="space-y-1">
                <span class="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                  {{ spotlightProduct.category_name }}
                </span>
                <h3 class="text-lg font-bold text-neutral-900 dark:text-white leading-snug">
                  {{ spotlightProduct.title }}
                </h3>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                  {{ spotlightProduct.description }}
                </p>
              </div>

              <!-- Price & Quick Acquire -->
              <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-mono text-neutral-400 uppercase block">Acquisition Price</span>
                  <span class="text-2xl font-mono font-black text-neutral-900 dark:text-white">
                    ${{ Number(spotlightProduct.price).toFixed(2) }}
                  </span>
                </div>

                <button
                  type="button"
                  class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-sm"
                  :class="isSpotlightAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-primary-500 hover:bg-primary-600 text-white active:scale-95'"
                  :disabled="isSpotlightAdding"
                  @click="handleSpotlightAdd"
                >
                  <UIcon v-if="isSpotlightAdding" name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
                  <UIcon v-else-if="isSpotlightAdded" name="i-lucide-check" class="w-4 h-4" />
                  <UIcon v-else name="i-lucide-shopping-bag" class="w-4 h-4" />
                  <span>{{ isSpotlightAdded ? 'ACQUIRED ✓' : 'ACQUIRE NOW' }}</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Department Index (Categories Redesigned) -->
    <section id="categories" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <span class="text-xs font-mono text-primary-600 dark:text-primary-400 tracking-wider uppercase font-bold">
            [ DEPT // INDEX ]
          </span>
          <h2 class="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 dark:text-white mt-1">
            Shop By Department
          </h2>
        </div>
        <NuxtLink
          to="/products"
          class="text-xs font-mono font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span>VIEW FULL CATALOG</span>
          <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5" />
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <NuxtLink
          v-for="(cat, idx) in categories"
          :key="cat.id"
          :to="`/products?category=${cat.id}`"
          class="group relative h-72 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-white flex flex-col justify-between p-5 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-300"
        >
          <!-- Background image with gradient tint -->
          <img
            :src="cat.image_url"
            :alt="cat.name"
            class="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          <!-- Top Department Number -->
          <div class="relative z-10 flex items-center justify-between">
            <span class="text-xs font-mono text-white/70">
              0{{ idx + 1 }} //
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 backdrop-blur-md text-white border border-white/10">
              {{ cat.item_count }} ITEMS
            </span>
          </div>

          <!-- Bottom Title & Arrow -->
          <div class="relative z-10 space-y-1">
            <h3 class="text-base font-bold text-white group-hover:text-primary-400 transition-colors">
              {{ cat.name }}
            </h3>
            <p class="text-[11px] text-neutral-300 line-clamp-2 leading-relaxed">
              {{ cat.description }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Curated Hardware Catalog (Featured Products) -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <span class="text-xs font-mono text-primary-600 dark:text-primary-400 tracking-wider uppercase font-bold">
            [ CURATION // VERIFIED ]
          </span>
          <h2 class="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 dark:text-white mt-1">
            Featured Hardware
          </h2>
        </div>
        <NuxtLink
          to="/products"
          class="text-xs font-mono font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span>CATALOG INDEX ({{ featuredProducts.length }})</span>
          <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5" />
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

    <!-- Engineering Standards Specification Table (Replaces Generic Perks) -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900/60 overflow-hidden divide-y divide-neutral-200 dark:divide-neutral-800 lg:divide-y-0 lg:divide-x grid grid-cols-1 lg:grid-cols-3">
        
        <div class="p-6 sm:p-8 space-y-3">
          <div class="flex items-center gap-2 text-xs font-mono text-primary-600 dark:text-primary-400 font-bold">
            <UIcon name="i-lucide-cpu" class="w-4 h-4" />
            <span>01 // LASER METROLOGY</span>
          </div>
          <h4 class="font-bold text-base text-neutral-900 dark:text-white">
            Individually Inspected & Calibrated
          </h4>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans">
            Every acoustic transducer, mechanical switch assembly, and silicon module is bench-tested before serialized dispatch.
          </p>
        </div>

        <div class="p-6 sm:p-8 space-y-3">
          <div class="flex items-center gap-2 text-xs font-mono text-primary-600 dark:text-primary-400 font-bold">
            <UIcon name="i-lucide-plane" class="w-4 h-4" />
            <span>02 // AIR EXPRESS LOGISTICS</span>
          </div>
          <h4 class="font-bold text-base text-neutral-900 dark:text-white">
            Complimentary Air Freight Over $150
          </h4>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans">
            Zero-friction global transit handled via DHL Express with temperature-controlled transit packaging and tracking.
          </p>
        </div>

        <div class="p-6 sm:p-8 space-y-3">
          <div class="flex items-center gap-2 text-xs font-mono text-primary-600 dark:text-primary-400 font-bold">
            <UIcon name="i-lucide-shield" class="w-4 h-4" />
            <span>03 // ARCHIVAL WARRANTY</span>
          </div>
          <h4 class="font-bold text-base text-neutral-900 dark:text-white">
            Up to 12-Year Hardware Coverage
          </h4>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans">
            We partner exclusively with tier-1 manufacturers guaranteeing long-term replacement parts and firmware support.
          </p>
        </div>

      </div>
    </section>

  </div>
</template>
