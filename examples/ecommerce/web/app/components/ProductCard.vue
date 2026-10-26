<script setup lang="ts">
const props = defineProps<{
  product: {
    id: string;
    title: string;
    slug: string;
    price: number | string;
    compare_at_price?: number | string | null;
    category_name: string;
    rating: number | string;
    review_count: number;
    badge?: string | null;
    images: string[];
    description: string;
    specs?: string | Record<string, string>;
    stock?: number;
  };
}>();

const { addItem } = useCart();
const isAdding = ref(false);
const isAdded = ref(false);
const activeImageIndex = ref(0);

const parsedSpecs = computed(() => {
  if (!props.product.specs) return [];
  let specObj: Record<string, any> = {};
  if (typeof props.product.specs === 'string') {
    try {
      specObj = JSON.parse(props.product.specs);
    } catch {
      return [];
    }
  } else {
    specObj = props.product.specs;
  }
  // Return the first 2-3 key specs as chips
  return Object.entries(specObj).slice(0, 3).map(([key, val]) => `${key}: ${val}`);
});

const handleAddToCart = async (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
  try {
    isAdding.value = true;
    await addItem(props.product.id, 1);
    isAdded.value = true;
    setTimeout(() => {
      isAdded.value = false;
    }, 2000);
  } finally {
    isAdding.value = false;
  }
};
</script>

<template>
  <div class="group relative flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-300 shadow-sm hover:shadow-md">
    
    <!-- Top Metadata Bar -->
    <div class="px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-500">
      <span class="uppercase tracking-wider">
        {{ product.category_name }}
      </span>

      <div class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full" :class="(product.stock ?? 10) > 5 ? 'bg-emerald-500' : 'bg-amber-500'" />
        <span class="text-[10px] text-neutral-400">
          {{ product.stock ? `${product.stock} IN STOCK` : 'AVAILABLE' }}
        </span>
      </div>
    </div>

    <!-- Product Visual Stage -->
    <NuxtLink :to="`/products/${product.id}`" class="relative aspect-[4/3] bg-neutral-100/70 dark:bg-neutral-950 block overflow-hidden">
      <img
        :src="product.images[activeImageIndex] || product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'"
        :alt="product.title"
        class="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />

      <!-- Floating Technical Badge -->
      <div v-if="product.badge" class="absolute top-3 left-3">
        <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider bg-neutral-900/90 text-white dark:bg-white dark:text-neutral-950 backdrop-blur-md shadow-sm">
          {{ product.badge }}
        </span>
      </div>

      <!-- Multi-Angle Image Dots (if multiple images) -->
      <div v-if="product.images.length > 1" class="absolute bottom-2.5 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-full">
        <button
          v-for="(_, idx) in product.images"
          :key="idx"
          class="w-1.5 h-1.5 rounded-full transition-all"
          :class="activeImageIndex === idx ? 'bg-white w-3' : 'bg-white/50'"
          @click.prevent="activeImageIndex = idx"
        />
      </div>
    </NuxtLink>

    <!-- Details & Specs Section -->
    <div class="flex flex-col flex-1 p-4 sm:p-5">
      <!-- Title -->
      <NuxtLink :to="`/products/${product.id}`" class="block">
        <h3 class="font-bold text-sm sm:text-base leading-snug text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
          {{ product.title }}
        </h3>
      </NuxtLink>

      <!-- Description preview -->
      <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
        {{ product.description }}
      </p>

      <!-- Technical Spec Chips -->
      <div v-if="parsedSpecs.length > 0" class="flex flex-wrap gap-1 mt-3">
        <span
          v-for="(spec, i) in parsedSpecs"
          :key="i"
          class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/50 dark:border-neutral-700/50"
        >
          {{ spec }}
        </span>
      </div>

      <!-- Pricing & Acquisition Footer -->
      <div class="mt-auto pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800">
        <div class="flex flex-col">
          <div class="flex items-baseline gap-1.5">
            <span class="text-base sm:text-lg font-mono font-bold tracking-tight text-neutral-900 dark:text-white">
              ${{ Number(product.price).toFixed(2) }}
            </span>
            <span
              v-if="product.compare_at_price && Number(product.compare_at_price) > Number(product.price)"
              class="text-xs font-mono text-neutral-400 line-through"
            >
              ${{ Number(product.compare_at_price).toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- Add Button -->
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-200 border"
          :class="isAdded
            ? 'bg-emerald-600 border-emerald-600 text-white'
            : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 border-neutral-900 dark:border-white hover:bg-primary-600 hover:border-primary-600 dark:hover:bg-neutral-200 active:scale-95'"
          :disabled="isAdding"
          @click="handleAddToCart"
        >
          <UIcon v-if="isAdding" name="i-lucide-loader-2" class="w-3.5 h-3.5 animate-spin" />
          <UIcon v-else-if="isAdded" name="i-lucide-check" class="w-3.5 h-3.5" />
          <UIcon v-else name="i-lucide-plus" class="w-3.5 h-3.5" />
          <span>{{ isAdded ? 'ADDED' : 'ACQUIRE' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>
