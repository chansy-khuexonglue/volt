<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const api = useApi();

const selectedCategory = ref((route.query.category as string) || '');
const searchQuery = ref((route.query.q as string) || '');
const sortBy = ref((route.query.sort as string) || 'newest');

// Fetch categories for filter chips
const { data: categoriesData } = await useAsyncData('categories_list', () => api.getCategories());
const categories = computed(() => categoriesData.value?.data || []);

// Fetch products based on query reactive parameters
const { data: productsData, refresh: refreshProducts, status } = await useAsyncData(
  'products_catalog',
  () =>
    api.getProducts({
      category: selectedCategory.value || undefined,
      search: searchQuery.value || undefined,
      sort: sortBy.value || undefined,
    }),
  {
    watch: [selectedCategory, sortBy],
  }
);

const products = computed(() => productsData.value?.data || []);
const totalCount = computed(() => productsData.value?.total || 0);

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
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    <!-- Breadcrumb & Header -->
    <div class="space-y-2">
      <div class="flex items-center gap-2 text-xs text-neutral-500">
        <NuxtLink to="/" class="hover:text-primary-500">Home</NuxtLink>
        <span>/</span>
        <span class="text-neutral-900 dark:text-white font-medium">Products</span>
      </div>
      <h1 class="text-3xl font-extrabold text-neutral-900 dark:text-white">
        Product Catalog
      </h1>
      <p class="text-sm text-neutral-500">
        Showing {{ products.length }} of {{ totalCount }} available items
      </p>
    </div>

    <!-- Controls Bar -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <!-- Category Chips -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
        <button
          class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors"
          :class="!selectedCategory ? 'bg-primary-600 text-white shadow-sm' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'"
          @click="selectCategory('')"
        >
          All Items
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors"
          :class="selectedCategory === cat.id ? 'bg-primary-600 text-white shadow-sm' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'"
          @click="selectCategory(cat.id)"
        >
          {{ cat.name }}
        </button>
      </div>

      <!-- Search & Sort -->
      <div class="flex items-center gap-3">
        <div class="relative flex-1 sm:w-64">
          <UIcon name="i-lucide-search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search catalog..."
            class="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            @keyup.enter="handleSearch"
          />
        </div>

        <select
          v-model="sortBy"
          class="px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="newest">Newest First</option>
          <option value="rating">Highest Rated</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>

    <!-- Product Grid -->
    <div v-if="status === 'pending'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="i in 8"
        :key="i"
        class="h-80 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse"
      />
    </div>

    <div v-else-if="products.length === 0" class="py-20 text-center space-y-3">
      <div class="w-16 h-16 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
        <UIcon name="i-lucide-package-x" class="w-8 h-8" />
      </div>
      <h3 class="text-base font-semibold text-neutral-900 dark:text-white">No products found</h3>
      <p class="text-xs text-neutral-500 max-w-sm mx-auto">Try resetting filters or searching for different keywords.</p>
      <UButton
        color="primary"
        variant="outline"
        size="sm"
        @click="selectedCategory = ''; searchQuery = ''; refreshProducts()"
      >
        Reset Filters
      </UButton>
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
