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
  };
}>();

const { addItem } = useCart();
const isAdding = ref(false);

const handleAddToCart = async () => {
  try {
    isAdding.value = true;
    await addItem(props.product.id, 1);
  } finally {
    isAdding.value = false;
  }
};
</script>

<template>
  <div class="group relative flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary-500/50 transition-all duration-300">
    <!-- Image & Badges -->
    <NuxtLink :to="`/products/${product.id}`" class="relative aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-800 block">
      <img
        :src="product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'"
        :alt="product.title"
        class="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <!-- Top badges -->
      <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
        <UBadge
          v-if="product.badge"
          color="primary"
          variant="solid"
          size="sm"
          class="font-medium shadow-sm"
        >
          {{ product.badge }}
        </UBadge>
      </div>

      <!-- Category Pill -->
      <div class="absolute bottom-3 left-3">
        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur-md">
          {{ product.category_name }}
        </span>
      </div>
    </NuxtLink>

    <!-- Details -->
    <div class="flex flex-col flex-1 p-5">
      <!-- Ratings -->
      <div class="flex items-center gap-1.5 mb-2 text-xs text-amber-500">
        <UIcon name="i-lucide-star" class="w-4 h-4 fill-amber-400" />
        <span class="font-semibold text-neutral-800 dark:text-neutral-200">{{ Number(product.rating).toFixed(1) }}</span>
        <span class="text-neutral-400">({{ product.review_count }})</span>
      </div>

      <!-- Title -->
      <NuxtLink :to="`/products/${product.id}`" class="group-hover:text-primary-500 transition-colors">
        <h3 class="font-semibold text-base line-clamp-1 text-neutral-900 dark:text-white">
          {{ product.title }}
        </h3>
      </NuxtLink>

      <!-- Description preview -->
      <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
        {{ product.description }}
      </p>

      <!-- Price & CTA Button -->
      <div class="mt-auto pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/80">
        <div class="flex flex-col">
          <span class="text-xs text-neutral-400 font-medium">Price</span>
          <div class="flex items-baseline gap-2">
            <span class="text-lg font-bold text-neutral-900 dark:text-white">
              ${{ Number(product.price).toFixed(2) }}
            </span>
            <span
              v-if="product.compare_at_price && Number(product.compare_at_price) > Number(product.price)"
              class="text-xs text-neutral-400 line-through"
            >
              ${{ Number(product.compare_at_price).toFixed(2) }}
            </span>
          </div>
        </div>

        <UButton
          color="primary"
          variant="solid"
          size="sm"
          icon="i-lucide-shopping-cart"
          :loading="isAdding"
          class="rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all"
          @click.prevent="handleAddToCart"
        >
          Add
        </UButton>
      </div>
    </div>
  </div>
</template>
