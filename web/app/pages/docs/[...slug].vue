<script setup lang="ts">
import { docsDatabase, docCategories, type DocItem } from '../../composables/useDocsData';

definePageMeta({
  layout: 'docs',
});

const route = useRoute();

const slug = computed(() => {
  const p = route.params.slug;
  if (!p) return 'introduction';
  if (Array.isArray(p)) return p[p.length - 1] || 'introduction';
  return p;
});

const doc = computed<DocItem>(() => {
  return docsDatabase[slug.value] || docsDatabase['introduction'];
});

useSeoMeta({
  title: computed(() => `${doc.value.title} - Volt Documentation`),
  description: computed(() => doc.value.description),
});

const allItems = computed(() => {
  return docCategories.flatMap((c) => c.items);
});

const currentIndex = computed(() => {
  return allItems.value.findIndex((item) => item.slug === slug.value);
});

const prevDoc = computed(() => {
  if (currentIndex.value > 0) return allItems.value[currentIndex.value - 1];
  return null;
});

const nextDoc = computed(() => {
  if (currentIndex.value < allItems.value.length - 1) return allItems.value[currentIndex.value + 1];
  return null;
});
</script>

<template>
  <div class="space-y-10">
    <!-- Breadcrumbs -->
    <div class="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-wider">
      <NuxtLink to="/docs/introduction" class="hover:text-primary-500 transition-colors">Docs</NuxtLink>
      <span>/</span>
      <span class="text-neutral-700 dark:text-neutral-300">{{ doc.category }}</span>
      <span>/</span>
      <span class="text-primary-500 font-bold">{{ doc.title }}</span>
    </div>

    <!-- Article Header -->
    <div class="space-y-3 border-b border-neutral-200 dark:border-neutral-800 pb-8">
      <div class="flex items-center gap-3">
        <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
          {{ doc.title }}
        </h1>
        <span
          v-if="doc.badge"
          class="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20"
        >
          {{ doc.badge }}
        </span>
      </div>
      <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl font-sans">
        {{ doc.description }}
      </p>
    </div>

    <!-- Interactive Code Snippet -->
    <div v-if="doc.codeSnippet" class="space-y-2">
      <div class="text-xs font-mono text-neutral-500 font-bold uppercase tracking-wider px-1 flex items-center gap-1.5">
        <UIcon name="i-lucide-terminal" class="w-3.5 h-3.5 text-primary-500" />
        <span>Implementation Example</span>
      </div>
      <CodeSnippet
        :code="doc.codeSnippet.code"
        :language="doc.codeSnippet.language"
        :filename="doc.codeSnippet.filename"
      />
    </div>

    <!-- Formatted Documentation Body -->
    <article class="prose dark:prose-invert max-w-none text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-6 font-sans">
      <div
        v-for="(para, idx) in doc.content.trim().split('\n\n')"
        :key="idx"
        class="space-y-3"
      >
        <!-- Heading 2 -->
        <h2
          v-if="para.startsWith('## ')"
          :id="para.replace('## ', '').toLowerCase().replace(/[^a-z0-9]+/g, '-')"
          class="text-xl font-bold text-neutral-950 dark:text-white tracking-tight pt-4 border-t border-neutral-100 dark:border-neutral-800/80 font-sans"
        >
          {{ para.replace('## ', '') }}
        </h2>

        <!-- Heading 1 -->
        <h3
          v-else-if="para.startsWith('# ')"
          :id="para.replace('# ', '').toLowerCase().replace(/[^a-z0-9]+/g, '-')"
          class="text-2xl font-bold text-neutral-950 dark:text-white tracking-tight font-sans"
        >
          {{ para.replace('# ', '') }}
        </h3>

        <!-- Table -->
        <div v-else-if="para.includes('| :--- |')" class="my-6 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <table class="w-full text-left text-xs font-mono">
            <tbody>
              <tr
                v-for="(row, rIdx) in para.split('\n')"
                :key="rIdx"
                :class="rIdx === 0 ? 'bg-neutral-100 dark:bg-neutral-950 font-bold border-b border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white' : 'border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/30'"
              >
                <td
                  v-for="(cell, cIdx) in row.split('|').filter(c => c.trim().length > 0)"
                  :key="cIdx"
                  class="p-3.5"
                >
                  {{ cell.trim() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Unordered List -->
        <ul v-else-if="para.startsWith('- ')" class="space-y-2 list-disc pl-5">
          <li v-for="(line, lIdx) in para.split('\n')" :key="lIdx">
            {{ line.replace('- ', '') }}
          </li>
        </ul>

        <!-- Normal Paragraph -->
        <p v-else class="text-neutral-600 dark:text-neutral-300 leading-relaxed">
          {{ para }}
        </p>
      </div>
    </article>

    <!-- Next & Previous Navigation Footer -->
    <div class="pt-10 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4 font-mono">
      <div>
        <NuxtLink
          v-if="prevDoc"
          :to="`/docs/${prevDoc.slug}`"
          class="flex flex-col p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all text-left group"
        >
          <span class="text-[10px] text-neutral-400 group-hover:text-primary-500 flex items-center gap-1 uppercase tracking-wider">
            <UIcon name="i-lucide-arrow-left" class="w-3.5 h-3.5" /> Previous
          </span>
          <span class="text-xs font-bold text-neutral-900 dark:text-neutral-100 mt-1">
            {{ prevDoc.title }}
          </span>
        </NuxtLink>
      </div>

      <div>
        <NuxtLink
          v-if="nextDoc"
          :to="`/docs/${nextDoc.slug}`"
          class="flex flex-col p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all text-right group"
        >
          <span class="text-[10px] text-neutral-400 group-hover:text-primary-500 flex items-center justify-end gap-1 uppercase tracking-wider">
            Next <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5" />
          </span>
          <span class="text-xs font-bold text-neutral-900 dark:text-neutral-100 mt-1">
            {{ nextDoc.title }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>

  <!-- Teleport Table of Contents to the right layout slot -->
  <template #toc>
    <DocsToc :toc="doc.toc" />
  </template>
</template>
