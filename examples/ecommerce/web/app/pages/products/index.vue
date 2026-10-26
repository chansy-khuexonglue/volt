<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const api = useApi();

const selectedCategory = ref((route.query.category as string) || '');
const searchQuery = ref((route.query.q as string) || '');
const sortBy = ref((route.query.sort as string) || 'newest');

// Synchronize filters when navigating or when route query changes
watch(
  () => route.query,
  (q) => {
    selectedCategory.value = (q.category as string) || '';
    searchQuery.value = (q.q as string) || '';
    sortBy.value = (q.sort as string) || 'newest';
  }
);

// Fetch categories for filter chips
const { data: categoriesData, refresh: refreshCategories } = await useAsyncData(
  'categories_list',
  () => api.getCategories()
);
const categories = computed(() => categoriesData.value?.data || []);

// Fetch products based on query reactive parameters
const { data: productsData, refresh: refreshProducts, status } = await useAsyncData(
  () =>
    api.getProducts({
      category: selectedCategory.value || undefined,
      search: searchQuery.value || undefined,
      sort: sortBy.value || undefined,
    }),
  {
    watch: [selectedCategory, sortBy, searchQuery],
  }
);

const products = computed(() => productsData.value?.data || []);
const totalCount = computed(() => productsData.value?.total || 0);

onMounted(() => {
  if (categories.value.length === 0) refreshCategories();
  if (products.value.length === 0) refreshProducts();
});

const handleSearch = () => {
  refreshProducts();
  router.push({
    query: {
      ...route.query,
      q: searchQuery.value || undefined,
      category: selectedCategory.value || undefined,
      sort: sortBy.value || undefined,
    },
  });
};

const selectCategory = (catId: string) => {
  selectedCategory.value = catId;
  router.push({
    query: {
      ...route.query,
      category: catId || undefined,
    },
  });
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
    
    <!-- Editorial Header & Telemetry -->
    <div class="border-b border-neutral-200 dark:border-neutral-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
          <NuxtLink to="/" class="hover:text-primary-500 transition-colors">ARCHIVE</NuxtLink>
          <span>/</span>
          <span class="text-neutral-900 dark:text-white font-bold">HARDWARE REGISTRY</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
          Component Catalog
        </h1>
        <p class="text-xs sm:text-sm text-neutral-500 font-mono">
          INDEXED // {{ products.length }} OF {{ totalCount }} HARDWARE UNITS AVAILABLE
        </p>
      </div>

      <!-- Quick Reset Button (if filters active) -->
      <div v-if="selectedCategory || searchQuery" class="flex items-center gap-2">
        <button
          class="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-mono text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          @click="selectCategory(''); searchQuery = ''; handleSearch()"
        >
          CLEAR ALL FILTERS [ × ]
        </button>
      </div>
    </div>

    <!-- Precision Control Bar -->
    <div class="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      
      <!-- Category Chips -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
        <button
          class="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-all border"
          :class="!selectedCategory
            ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-2xs'
            : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'"
          @click="selectCategory('')"
        >
          ALL ({{ totalCount }})
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-all border"
          :class="selectedCategory === cat.id
            ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-2xs'
            : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'"
          @click="selectCategory(cat.id)"
        >
          {{ cat.name }} ({{ cat.item_count }})
        </button>
      </div>

      <!-- Search & Sort Controls -->
      <div class="flex items-center gap-3">
        <div class="relative flex-1 sm:w-64">
          <UIcon name="i-lucide-search" class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search catalog..."
            class="w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            @keyup.enter="handleSearch"
          />
        </div>

        <select
          v-model="sortBy"
          class="px-3 py-1.5 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="newest">LATEST ADDITIONS</option>
          <option value="rating">HIGHEST RATED</option>
          <option value="price_asc">PRICE: LOW → HIGH</option>
          <option value="price_desc">PRICE: HIGH → LOW</option>
        </select>
      </div>

    </div>

    <!-- Product Grid -->
    <div v-if="status === 'pending'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="i in 8"
        :key="i"
        class="h-80 rounded-xl bg-neutral-100 dark:bg-neutral-850 animate-pulse border border-neutral-200/50 dark:border-neutral-800/50"
      />
    </div>

    <div v-else-if="products.length === 0" class="py-24 text-center space-y-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
      <div class="w-12 h-12 mx-auto rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 font-mono text-xl">
        ∅
      </div>
      <div class="space-y-1">
        <h3 class="text-base font-mono font-bold text-neutral-900 dark:text-white">NO HARDWARE UNITS FOUND</h3>
        <p class="text-xs text-neutral-400 max-w-sm mx-auto">No components match your specified query parameters.</p>
      </div>
      <button
        class="px-4 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-mono text-xs font-bold hover:bg-primary-600 transition"
        @click="selectedCategory = ''; searchQuery = ''; refreshProducts()"
      >
        RESET ALL FILTERS
      </button>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>

  </div>
</template>
