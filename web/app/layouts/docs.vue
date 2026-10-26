<script setup lang="ts">
import { docCategories } from '../composables/useDocsData';
const route = useRoute();
function navigateToDoc(event: Event) {
  const target = event.target as HTMLSelectElement;
  if (target.value) navigateTo(target.value);
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-neutral-50/40 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans antialiased selection:bg-primary-500/20 selection:text-primary-500">
    <AppHeader />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full pt-8 pb-16">
      <div class="mb-6 lg:hidden">
        <label for="docs-navigation" class="mb-2 block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Documentation navigation</label>
        <select id="docs-navigation" aria-label="Documentation navigation" :value="route.path === '/docs' ? '/docs/introduction' : route.path" class="w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-sm dark:border-neutral-700 dark:bg-neutral-900" @change="navigateToDoc">
          <optgroup v-for="category in docCategories" :key="category.title" :label="category.title">
            <option v-for="item in category.items" :key="item.slug" :value="`/docs/${item.slug}`">{{ item.title }}</option>
          </optgroup>
        </select>
      </div>
      <div class="flex items-start gap-8">
        <!-- Left: Documentation Navigation Sidebar -->
        <DocsSidebar />

        <!-- Middle: Main Article Content Slot -->
        <main class="flex-1 min-w-0">
          <slot />
        </main>
      </div>
    </div>

    <AppFooter />
  </div>
</template>
