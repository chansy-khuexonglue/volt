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

// Global hotkey: Cmd+K / Ctrl+K
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
      class="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-zinc-950/60 backdrop-blur-sm transition-all"
      @click.self="closeSearch"
    >
      <div class="w-full max-w-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 animate-in fade-in zoom-in-95 duration-150">
        <!-- Search Input Bar -->
        <div class="flex items-center px-4 border-b border-zinc-200 dark:border-zinc-800">
          <UIcon name="i-lucide-search" class="w-5 h-5 text-zinc-400 mr-3" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search documentation, APIs, plugins, guides... (ESC to close)"
            class="w-full py-4 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none font-sans"
            autofocus
          />
          <button
            @click="closeSearch"
            class="px-2 py-1 text-xs font-mono text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded bg-zinc-100 dark:bg-zinc-800"
          >
            ESC
          </button>
        </div>

        <!-- Search Results -->
        <div class="max-h-96 overflow-y-auto p-2">
          <div v-if="searchQuery.trim() && results.length === 0" class="p-8 text-center text-sm text-zinc-500">
            No matching documents found for "{{ searchQuery }}".
          </div>

          <div v-else-if="!searchQuery.trim()" class="p-6 text-center text-xs text-zinc-400 font-mono">
            Type keywords like <span class="text-cyan-500 font-semibold">prisma</span>, <span class="text-cyan-500 font-semibold">router</span>, <span class="text-cyan-500 font-semibold">validation</span>, or <span class="text-cyan-500 font-semibold">context</span>...
          </div>

          <div v-else class="space-y-1">
            <button
              v-for="item in results"
              :key="item.slug"
              @click="navigateToDoc(item.slug)"
              class="w-full text-left p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors flex flex-col gap-1 group"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-cyan-500 transition-colors">
                  {{ item.title }}
                </span>
                <span class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {{ item.category }}
                </span>
              </div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                {{ item.snippet }}
              </p>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
          <span class="flex items-center gap-1.5">
            <kbd class="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">↑↓</kbd> navigate
            <kbd class="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 ml-2">↵</kbd> select
          </span>
          <span>Volt Fast Search</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
