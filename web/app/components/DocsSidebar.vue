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
        <div class="flex items-center gap-2 px-2 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <UIcon :name="cat.icon" class="w-3.5 h-3.5 text-primary-500" />
          <span>{{ cat.title }}</span>
        </div>

        <!-- Category Items -->
        <ul class="space-y-0.5 border-l border-neutral-200 dark:border-neutral-800 ml-3 pl-2">
          <li v-for="item in cat.items" :key="item.slug">
            <NuxtLink
              :to="`/docs/${item.slug}`"
              class="flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-all group font-mono"
              :class="[
                currentSlug === item.slug
                  ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold border-l-2 border-primary-500 -ml-[9px] pl-3'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40',
              ]"
            >
              <span class="truncate">{{ item.title }}</span>
              <span
                v-if="item.badge"
                class="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase tracking-wider"
                :class="item.badge === 'New' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-primary-500/10 text-primary-500 border border-primary-500/20'"
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
