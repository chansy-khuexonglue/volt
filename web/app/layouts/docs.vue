<script setup lang="ts">
import { docCategories } from '../composables/useDocsData';
const route = useRoute();
const selectedDoc = computed(() => route.path === '/docs' ? '/docs/introduction' : route.path);
const navigationItems = docCategories.map(category => [
  { label: category.title, value: `category-${category.title}`, type: 'label' as const },
  ...category.items.map(item => ({ label: item.title, value: `/docs/${item.slug}` })),
]);

function navigateToDoc(value: string | undefined) {
  if (value && value !== selectedDoc.value) navigateTo(value);
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-neutral-50/40 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans antialiased selection:bg-primary-500/20 selection:text-primary-500">
    <AppHeader />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full pt-8 pb-16">
      <div class="mb-6 lg:hidden">
        <label for="docs-navigation" class="mb-2 block text-xs font-semibold tracking-wide text-neutral-600 dark:text-neutral-400">Documentation</label>
        <USelectMenu
          id="docs-navigation"
          :model-value="selectedDoc"
          :items="navigationItems"
          value-key="value"
          icon="i-lucide-book-open"
          size="lg"
          placeholder="Choose a page"
          :search-input="{ placeholder: 'Search documentation...' }"
          :ui="{ base: 'w-full min-h-12 rounded-xl bg-white dark:bg-neutral-900', content: 'w-(--reka-combobox-trigger-width)', item: 'min-h-11' }"
          class="w-full"
          @update:model-value="navigateToDoc"
        />
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
