<script setup lang="ts">
import { docCategories } from '../composables/useDocsData';

const route = useRoute();
const currentSlug = computed(() => {
  const parts = route.path.split('/');
  return parts[parts.length - 1] || 'introduction';
});
</script>

<template>
  <aside class="w-64 shrink-0 hidden lg:block sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pr-4 pb-12 select-none">
    <div class="space-y-6">
      <div v-for="cat in docCategories" :key="cat.title" class="space-y-2">
        <!-- Category Title -->
        <div class="flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <UIcon :name="cat.icon" class="w-4 h-4 text-cyan-500" />
          <span>{{ cat.title }}</span>
        </div>

        <!-- Category Items -->
        <ul class="space-y-0.5 border-l border-zinc-200 dark:border-zinc-800 ml-3 pl-2">
          <li v-for="item in cat.items" :key="item.slug">
            <NuxtLink
              :to="`/docs/${item.slug}`"
              class="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm transition-all group font-medium"
              :class="[
                currentSlug === item.slug
                  ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold border-l-2 border-cyan-500 -ml-[9px] pl-3'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40',
              ]"
            >
              <span class="truncate">{{ item.title }}</span>
              <span
                v-if="item.badge"
                class="text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider"
                :class="item.badge === 'New' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'"
              >
                {{ item.badge }}
              </span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>
