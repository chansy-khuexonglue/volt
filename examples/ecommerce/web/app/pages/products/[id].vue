<script setup lang="ts">
const route = useRoute();
const api = useApi();
const { addItem } = useCart();

const productId = computed(() => route.params.id as string);
const quantity = ref(1);
const selectedImageIndex = ref(0);
const isAddingToCart = ref(false);
const isAdded = ref(false);

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
    isAdded.value = true;
    setTimeout(() => {
      isAdded.value = false;
    }, 2500);
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
    await api.addReview(productId.value, reviewForm.value);
    reviewSuccessMessage.value = 'Verified review has been permanently committed to PostgreSQL.';
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
  <div v-if="product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-12">
    
    <!-- Precision Breadcrumb & Telemetry -->
    <div class="flex items-center justify-between text-[11px] font-mono text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-4">
      <div class="flex items-center gap-2">
        <NuxtLink to="/" class="hover:text-primary-500 transition-colors">ARCHIVE</NuxtLink>
        <span>/</span>
        <NuxtLink to="/products" class="hover:text-primary-500 transition-colors">HARDWARE</NuxtLink>
        <span>/</span>
        <span class="text-neutral-900 dark:text-white font-bold uppercase truncate max-w-xs">{{ product.title }}</span>
      </div>

      <div class="hidden sm:flex items-center gap-3">
        <span>REF: {{ product.id }}</span>
        <span>|</span>
        <span class="text-emerald-500">BENCH-TESTED: PASS</span>
      </div>
    </div>

    <!-- Product Master Stage -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      
      <!-- Left Column: Gallery & Angle Selector -->
      <div class="lg:col-span-7 space-y-4">
        <!-- Main Image Stage -->
        <div class="aspect-[16/11] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 relative group">
          <img
            :src="product.images[selectedImageIndex] || product.images[0]"
            :alt="product.title"
            class="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
          />

          <!-- Floating badge -->
          <div v-if="product.badge" class="absolute top-4 left-4">
            <span class="px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider uppercase bg-neutral-900/90 text-white dark:bg-white dark:text-neutral-950 backdrop-blur-md">
              {{ product.badge }}
            </span>
          </div>

          <div class="absolute bottom-4 right-4 text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-md">
            VIEW {{ selectedImageIndex + 1 }} / {{ product.images.length }}
          </div>
        </div>

        <!-- Thumbnails Multi-Angle Rail -->
        <div v-if="product.images.length > 1" class="flex items-center gap-3">
          <button
            v-for="(img, idx) in product.images"
            :key="idx"
            class="w-20 h-16 rounded-xl overflow-hidden border-2 transition-all bg-neutral-100 dark:bg-neutral-900"
            :class="selectedImageIndex === idx
              ? 'border-neutral-900 dark:border-white shadow-sm'
              : 'border-neutral-200 dark:border-neutral-800 opacity-60 hover:opacity-100'"
            @click="selectedImageIndex = idx"
          >
            <img :src="img" :alt="product.title" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Right Column: Technical Specs & Acquisition Deck -->
      <div class="lg:col-span-5 space-y-6">
        
        <!-- Category & Title -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
              {{ product.category_name }}
            </span>
            <span class="text-[11px] font-mono text-neutral-400">
              ● {{ product.stock }} UNITS IN WAREHOUSE
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white uppercase leading-tight">
            {{ product.title }}
          </h1>

          <!-- Star Ratings -->
          <div class="flex items-center gap-2 text-xs font-mono pt-1">
            <div class="flex items-center text-amber-500">
              <UIcon
                v-for="star in 5"
                :key="star"
                name="i-lucide-star"
                class="w-3.5 h-3.5"
                :class="star <= Math.round(Number(product.rating)) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-700'"
              />
            </div>
            <span class="font-bold text-neutral-900 dark:text-white">{{ Number(product.rating).toFixed(1) }}</span>
            <span class="text-neutral-400">/ 5.0</span>
            <span class="text-neutral-400">({{ product.review_count }} VERIFIED REVIEWS)</span>
          </div>
        </div>

        <!-- Price Section -->
        <div class="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-1">
          <span class="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Acquisition Price</span>
          <div class="flex items-baseline gap-3">
            <span class="text-3xl font-mono font-black text-neutral-900 dark:text-white">
              ${{ Number(product.price).toFixed(2) }}
            </span>
            <span
              v-if="product.compare_at_price && Number(product.compare_at_price) > Number(product.price)"
              class="text-sm font-mono text-neutral-400 line-through"
            >
              ${{ Number(product.compare_at_price).toFixed(2) }}
            </span>
            <span
              v-if="product.compare_at_price && Number(product.compare_at_price) > Number(product.price)"
              class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
            >
              -${{ (Number(product.compare_at_price) - Number(product.price)).toFixed(0) }} OFF
            </span>
          </div>
        </div>

        <!-- Description -->
        <p class="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
          {{ product.description }}
        </p>

        <!-- Actions -->
        <div class="space-y-4 pt-2">
          <div class="flex items-center gap-3">
            <!-- Quantity Counter -->
            <div class="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-900 font-mono text-xs">
              <button
                class="px-3 py-2.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                :disabled="quantity <= 1"
                @click="quantity = Math.max(1, quantity - 1)"
              >
                -
              </button>
              <span class="px-4 font-bold text-neutral-900 dark:text-white">
                {{ quantity }}
              </span>
              <button
                class="px-3 py-2.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                @click="quantity++"
              >
                +
              </button>
            </div>

            <!-- Acquire Button -->
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-lg font-mono text-xs font-bold transition-all shadow-sm duration-200"
              :class="isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-primary-600 dark:hover:bg-neutral-200 active:scale-95'"
              :disabled="isAddingToCart"
              @click="handleAddToCart"
            >
              <UIcon v-if="isAddingToCart" name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
              <UIcon v-else-if="isAdded" name="i-lucide-check" class="w-4 h-4" />
              <UIcon v-else name="i-lucide-plus" class="w-4 h-4" />
              <span>{{ isAdded ? 'ACQUIRED TO MANIFEST ✓' : 'ACQUIRE HARDWARE' }}</span>
            </button>
          </div>

          <!-- Shipping Status Line -->
          <div class="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span class="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              AUTHENTIC SERIALIZED DISPATCH
            </span>
            <span>DHL AIR FREIGHT AVAILABLE</span>
          </div>
        </div>

      </div>
    </div>

    <!-- Specifications Table -->
    <div v-if="Object.keys(specs).length > 0" class="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
      <div class="flex items-center gap-2">
        <span class="text-xs font-mono font-bold text-primary-600 dark:text-primary-400 uppercase">
          [ ARCHITECTURE // SPECS ]
        </span>
      </div>
      <h2 class="text-xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white">
        Engineering Specifications
      </h2>

      <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900 shadow-2xs">
        <table class="w-full text-left font-mono text-xs">
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <tr v-for="(val, key) in specs" :key="key" class="hover:bg-neutral-50/50 dark:hover:bg-neutral-850">
              <td class="px-6 py-3 font-semibold text-neutral-500 uppercase w-1/3">
                {{ key }}
              </td>
              <td class="px-6 py-3 text-neutral-900 dark:text-white font-medium">
                {{ val }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Customer Reviews Section -->
    <div id="reviews" class="space-y-8 pt-8 border-t border-neutral-200 dark:border-neutral-800 scroll-mt-20">
      <div>
        <span class="text-xs font-mono font-bold text-primary-600 dark:text-primary-400 uppercase">
          [ LOG // VERIFIED FEEDBACK ]
        </span>
        <h2 class="text-xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white mt-1">
          Purchaser Verification Records
        </h2>
      </div>

      <!-- Add Review Form -->
      <div class="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 font-mono">
        <h3 class="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">
          SUBMIT HARDWARE REPORT
        </h3>

        <div v-if="reviewSuccessMessage" class="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
          <span>{{ reviewSuccessMessage }}</span>
        </div>

        <form class="space-y-4 font-sans text-xs" @submit.prevent="handleReviewSubmit">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-mono text-neutral-500 uppercase mb-1">Verifier Name</label>
              <input
                v-model="reviewForm.userName"
                type="text"
                placeholder="e.g. David Lin"
                required
                class="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono"
              />
            </div>
            <div>
              <label class="block text-[11px] font-mono text-neutral-500 uppercase mb-1">Score Rating</label>
              <select
                v-model.number="reviewForm.rating"
                class="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono"
              >
                <option :value="5">5.0 / 5.0 — FLAWLESS CALIBRATION</option>
                <option :value="4">4.0 / 5.0 — EXCELLENT CRAFT</option>
                <option :value="3">3.0 / 5.0 — MEETS SPECIFICATION</option>
                <option :value="2">2.0 / 5.0 — BELOW EXPECTATIONS</option>
                <option :value="1">1.0 / 5.0 — DEFECTIVE</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-mono text-neutral-500 uppercase mb-1">Report Summary Title</label>
            <input
              v-model="reviewForm.title"
              type="text"
              placeholder="e.g. Acoustic accuracy matches studio reference"
              required
              class="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono"
            />
          </div>

          <div>
            <label class="block text-[11px] font-mono text-neutral-500 uppercase mb-1">Evaluation Details</label>
            <textarea
              v-model="reviewForm.comment"
              rows="3"
              placeholder="Detailed observations on materials, ergonomics, and acoustic/silicon performance..."
              required
              class="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <button
            type="submit"
            class="px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-mono text-xs font-bold hover:bg-primary-600 transition"
            :disabled="isSubmittingReview"
          >
            {{ isSubmittingReview ? 'TRANSMITTING...' : 'COMMIT REPORT TO DATABASE' }}
          </button>
        </form>
      </div>

      <!-- Reviews Feed -->
      <div class="space-y-4">
        <div
          v-for="rev in reviews"
          :key="rev.id"
          class="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2"
        >
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="font-bold text-neutral-900 dark:text-white">{{ rev.user_name }}</span>
            <div class="flex items-center text-amber-500 gap-1">
              <span>★ {{ rev.rating }}.0</span>
              <span class="text-neutral-400">// VERIFIED PURCHASE</span>
            </div>
          </div>
          <h4 class="font-bold text-sm text-neutral-900 dark:text-white">{{ rev.title }}</h4>
          <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">{{ rev.comment }}</p>
        </div>
      </div>

    </div>

  </div>
</template>
