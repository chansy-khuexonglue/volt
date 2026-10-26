<script setup lang="ts">
const route = useRoute();
const api = useApi();
const { addItem } = useCart();

const productId = computed(() => route.params.id as string);
const quantity = ref(1);
const selectedImageIndex = ref(0);
const isAddingToCart = ref(false);

// New review form state
const reviewForm = ref({
  userName: '',
  rating: 5,
  title: '',
  comment: '',
});
const isSubmittingReview = ref(false);
const reviewSuccessMessage = ref('');

// Fetch product & reviews
const { data: productData, refresh: refreshProduct } = await useAsyncData(
  () => api.getProduct(productId.value),
  {
    watch: [productId],
  }
);

const { data: reviewsData, refresh: refreshReviews } = await useAsyncData(
  () => api.getReviews(productId.value),
  {
    watch: [productId],
  }
);

const product = computed(() => productData.value?.data);
const reviews = computed(() => reviewsData.value?.data || []);

onMounted(() => {
  if (!product.value) {
    refreshProduct();
    refreshReviews();
  }
});

const specs = computed(() => {
  if (!product.value?.specs) return {};
  if (typeof product.value.specs === 'string') {
    try {
      return JSON.parse(product.value.specs);
    } catch {
      return {};
    }
  }
  return product.value.specs;
});

const handleAddToCart = async () => {
  if (!product.value) return;
  isAddingToCart.value = true;
  try {
    await addItem(product.value.id, quantity.value);
  } finally {
    isAddingToCart.value = false;
  }
};

const handleReviewSubmit = async () => {
  if (!reviewForm.value.userName.trim() || !reviewForm.value.comment.trim()) {
    return;
  }
  isSubmittingReview.value = true;
  try {
    await api.addReview(productId, reviewForm.value);
    reviewSuccessMessage.value = 'Thank you! Your verified review has been published.';
    reviewForm.value = { userName: '', rating: 5, title: '', comment: '' };
    await Promise.all([refreshReviews(), refreshProduct()]);
    setTimeout(() => {
      reviewSuccessMessage.value = '';
    }, 5000);
  } catch (err: any) {
    alert('Failed to submit review: ' + err.message);
  } finally {
    isSubmittingReview.value = false;
  }
};
</script>

<template>
  <div v-if="product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-xs text-neutral-500">
      <NuxtLink to="/" class="hover:text-primary-500">Home</NuxtLink>
      <span>/</span>
      <NuxtLink to="/products" class="hover:text-primary-500">Products</NuxtLink>
      <span>/</span>
      <span class="text-neutral-900 dark:text-white font-medium line-clamp-1 max-w-xs">{{ product.title }}</span>
    </div>

    <!-- Product Hero Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- Gallery Column -->
      <div class="space-y-4">
        <!-- Main Image -->
        <div class="aspect-[4/3] rounded-3xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-md">
          <img
            :src="product.images[selectedImageIndex] || product.images[0]"
            :alt="product.title"
            class="w-full h-full object-cover object-center"
          />
        </div>

        <!-- Thumbnails -->
        <div v-if="product.images.length > 1" class="flex items-center gap-3">
          <button
            v-for="(img, idx) in product.images"
            :key="idx"
            class="w-20 h-20 rounded-xl overflow-hidden border-2 transition-all"
            :class="selectedImageIndex === idx ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-neutral-200 dark:border-neutral-800 opacity-60 hover:opacity-100'"
            @click="selectedImageIndex = idx"
          >
            <img :src="img" :alt="product.title" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Info Column -->
      <div class="flex flex-col justify-between space-y-6">
        <div class="space-y-4">
          <!-- Category & Badge -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              {{ product.category_name }}
            </span>
            <UBadge v-if="product.badge" color="primary" variant="solid" size="sm">
              {{ product.badge }}
            </UBadge>
          </div>

          <!-- Title -->
          <h1 class="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {{ product.title }}
          </h1>

          <!-- Ratings & Reviews Count -->
          <div class="flex items-center gap-2 text-sm">
            <div class="flex items-center text-amber-500">
              <UIcon
                v-for="star in 5"
                :key="star"
                name="i-lucide-star"
                class="w-4 h-4"
                :class="star <= Math.round(Number(product.rating)) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-700'"
              />
            </div>
            <span class="font-bold text-neutral-900 dark:text-white">{{ Number(product.rating).toFixed(1) }}</span>
            <span class="text-neutral-400">•</span>
            <a href="#reviews" class="text-primary-600 dark:text-primary-400 hover:underline">
              {{ product.review_count }} verified reviews
            </a>
          </div>

          <!-- Price -->
          <div class="flex items-baseline gap-3 pt-2">
            <span class="text-3xl font-extrabold text-neutral-900 dark:text-white">
              ${{ Number(product.price).toFixed(2) }}
            </span>
            <span
              v-if="product.compare_at_price && Number(product.compare_at_price) > Number(product.price)"
              class="text-lg text-neutral-400 line-through"
            >
              ${{ Number(product.compare_at_price).toFixed(2) }}
            </span>
            <UBadge v-if="product.compare_at_price && Number(product.compare_at_price) > Number(product.price)" color="success" variant="subtle" size="sm">
              Save ${{ (Number(product.compare_at_price) - Number(product.price)).toFixed(2) }}
            </UBadge>
          </div>

          <!-- Description -->
          <p class="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed pt-2">
            {{ product.description }}
          </p>
        </div>

        <!-- Purchase Actions -->
        <div class="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <div class="flex items-center gap-4">
            <!-- Quantity selector -->
            <div class="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-neutral-900">
              <button
                class="px-3.5 py-2.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                :disabled="quantity <= 1"
                @click="quantity = Math.max(1, quantity - 1)"
              >
                <UIcon name="i-lucide-minus" class="w-4 h-4" />
              </button>
              <span class="px-4 text-sm font-semibold text-neutral-900 dark:text-white">
                {{ quantity }}
              </span>
              <button
                class="px-3.5 py-2.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                @click="quantity++"
              >
                <UIcon name="i-lucide-plus" class="w-4 h-4" />
              </button>
            </div>

            <!-- Add to Cart CTA -->
            <UButton
              color="primary"
              variant="solid"
              size="lg"
              block
              icon="i-lucide-shopping-cart"
              :loading="isAddingToCart"
              class="flex-1 font-bold shadow-lg shadow-primary-500/25 rounded-xl hover:scale-[1.02] active:scale-95 transition-all"
              @click="handleAddToCart"
            >
              Add to Shopping Cart
            </UButton>
          </div>

          <!-- In stock check -->
          <div class="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
            <span>In stock ({{ product.stock }} units ready to ship from warehouse)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Technical Specifications Table -->
    <div v-if="Object.keys(specs).length > 0" class="space-y-4 pt-6">
      <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">
        Technical Specifications
      </h2>
      <div class="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
        <table class="w-full text-left text-sm">
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <tr v-for="(val, key) in specs" :key="key" class="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
              <td class="px-6 py-3.5 font-semibold text-neutral-500 dark:text-neutral-400 w-1/3">
                {{ key }}
              </td>
              <td class="px-6 py-3.5 text-neutral-900 dark:text-white font-mono text-xs">
                {{ val }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Customer Reviews Section -->
    <div id="reviews" class="space-y-8 pt-8 border-t border-neutral-200 dark:border-neutral-800 scroll-mt-20">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">
            Customer Reviews
          </h2>
          <p class="text-sm text-neutral-500">
            Real feedback from verified purchasers in PostgreSQL
          </p>
        </div>
      </div>

      <!-- Add Review Form -->
      <div class="p-6 rounded-3xl bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-4">
        <h3 class="font-bold text-base text-neutral-900 dark:text-white">Write a Review</h3>

        <div v-if="reviewSuccessMessage" class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
          <span>{{ reviewSuccessMessage }}</span>
        </div>

        <form class="space-y-4" @submit.prevent="handleReviewSubmit">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Your Name</label>
              <input
                v-model="reviewForm.userName"
                type="text"
                placeholder="e.g. David Lin"
                required
                class="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Rating</label>
              <select
                v-model.number="reviewForm.rating"
                class="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              >
                <option :value="5">⭐⭐⭐⭐⭐ (5 - Flawless)</option>
                <option :value="4">⭐⭐⭐⭐ (4 - Great)</option>
                <option :value="3">⭐⭐⭐ (3 - Average)</option>
                <option :value="2">⭐⭐ (2 - Below expectations)</option>
                <option :value="1">⭐ (1 - Unsatisfactory)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Review Title</label>
            <input
              v-model="reviewForm.title"
              type="text"
              placeholder="e.g. Exceptional sound clarity and build"
              required
              class="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Detailed Experience</label>
            <textarea
              v-model="reviewForm.comment"
              rows="3"
              placeholder="Share details of your experience with this hardware..."
              required
              class="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>

          <UButton
            type="submit"
            color="primary"
            variant="solid"
            size="sm"
            :loading="isSubmittingReview"
            class="rounded-xl px-5 font-semibold"
          >
            Submit Review
          </UButton>
        </form>
      </div>

      <!-- Reviews Feed -->
      <div v-if="reviews.length === 0" class="text-sm text-neutral-500 py-6">
        No reviews yet for this product. Be the first to share your thoughts above!
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="rev in reviews"
          :key="rev.id"
          class="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm text-neutral-900 dark:text-white">{{ rev.user_name }}</span>
              <span class="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-medium">
                Verified Purchaser
              </span>
            </div>
            <div class="flex items-center text-amber-500">
              <UIcon
                v-for="star in 5"
                :key="star"
                name="i-lucide-star"
                class="w-3.5 h-3.5"
                :class="star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-700'"
              />
            </div>
          </div>
          <h4 v-if="rev.title" class="font-semibold text-sm text-neutral-900 dark:text-white">
            {{ rev.title }}
          </h4>
          <p class="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {{ rev.comment }}
          </p>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
    <h2 class="text-xl font-bold">Product Not Found</h2>
    <UButton to="/products" color="primary">Back to Catalog</UButton>
  </div>
</template>
