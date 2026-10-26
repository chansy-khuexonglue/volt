<script setup lang="ts">
import { useSearch } from '../composables/useSearch';

const { isSearchOpen, closeSearch, search } = useSearch();
const searchQuery = ref('');
const router = useRouter();

const results = computed(() => search(searchQuery.value));

function navigateToDoc(slug: string) {
  closeSearch();
  searchQuery.value = '';
  router.push(`/docs/${slug}`);
}

onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      isSearchOpen.value = !isSearchOpen.value;
    }
    if (e.key === 'Escape' && isSearchOpen.value) {
      closeSearch();
    }
  };
  window.addEventListener('keydown', handleKeydown);
  onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isSearchOpen"
      class="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md transition-all font-mono"
      @click.self="closeSearch"
    >
      <div class="w-full max-w-xl rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 animate-in fade-in zoom-in-95 duration-150">
        <!-- Search Input Bar -->
        <div class="flex items-center px-4 border-b border-neutral-200 dark:border-neutral-800">
          <UIcon name="i-lucide-search" class="w-4 h-4 text-neutral-400 mr-3" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search documentation, APIs, plugins, guides..."
            class="w-full py-3.5 bg-transparent text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none font-mono"
            autofocus
          />
          <button
            type="button"
            @click="closeSearch"
            class="px-2 py-0.5 text-[10px] font-mono text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 cursor-pointer select-none"
          >
            ESC
          </button>
        </div>

        <!-- Search Results -->
        <div class="max-h-96 overflow-y-auto p-2">
          <div v-if="searchQuery.trim() && results.length === 0" class="p-8 text-center text-xs text-neutral-500">
            No matching documents found for "{{ searchQuery }}".
          </div>

          <div v-else-if="!searchQuery.trim()" class="p-6 text-center text-xs text-neutral-400">
            Type keywords like <span class="text-primary-500 font-bold">prisma</span>, <span class="text-primary-500 font-bold">router</span>, <span class="text-primary-500 font-bold">validation</span>...
          </div>

          <div v-else class="space-y-1">
            <button
              v-for="item in results"
              :key="item.slug"
              @click="navigateToDoc(item.slug)"
              class="w-full text-left p-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors flex flex-col gap-1 group"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors">
                  {{ item.title }}
                </span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 uppercase">
                  {{ item.category }}
                </span>
              </div>
              <p class="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 font-sans">
                {{ item.snippet }}
              </p>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 text-[10px] font-mono text-neutral-400 flex items-center justify-between">
          <span class="flex items-center gap-1.5">
            <kbd class="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">↑↓</kbd> navigate
            <kbd class="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 ml-2">↵</kbd> select
          </span>
          <span class="text-primary-500 font-bold">VOLT FAST SEARCH</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
