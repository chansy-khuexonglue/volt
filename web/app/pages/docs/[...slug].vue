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

// Determine previous & next documentation articles
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
    <!-- Breadcrumbs & Category Badge -->
    <div class="flex items-center gap-2 text-xs font-mono text-zinc-500">
      <NuxtLink to="/docs/introduction" class="hover:text-cyan-500 transition-colors">Docs</NuxtLink>
      <span>/</span>
      <span class="text-zinc-700 dark:text-zinc-300">{{ doc.category }}</span>
      <span>/</span>
      <span class="text-cyan-500 font-semibold">{{ doc.title }}</span>
    </div>

    <!-- Article Header -->
    <div class="space-y-3 border-b border-zinc-200 dark:border-zinc-800 pb-8">
      <div class="flex items-center gap-3">
        <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
          {{ doc.title }}
        </h1>
        <span
          v-if="doc.badge"
          class="text-xs font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-500 border border-cyan-500/30"
        >
          {{ doc.badge }}
        </span>
      </div>
      <p class="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
        {{ doc.description }}
      </p>
    </div>

    <!-- Interactive Code Snippet (if provided) -->
    <div v-if="doc.codeSnippet" class="space-y-2">
      <div class="text-xs font-mono text-zinc-400 font-medium px-1 flex items-center gap-1.5">
        <UIcon name="i-lucide-terminal" class="w-3.5 h-3.5 text-cyan-400" />
        <span>Example Usage</span>
      </div>
      <CodeSnippet
        :code="doc.codeSnippet.code"
        :language="doc.codeSnippet.language"
        :filename="doc.codeSnippet.filename"
      />
    </div>

    <!-- Formatted Documentation Body -->
    <article class="prose dark:prose-invert max-w-none text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-6">
      <div
        v-for="(para, idx) in doc.content.trim().split('\n\n')"
        :key="idx"
        class="space-y-3"
      >
        <!-- Heading 2 -->
        <h2
          v-if="para.startsWith('## ')"
          :id="para.replace('## ', '').toLowerCase().replace(/[^a-z0-9]+/g, '-')"
          class="text-xl font-bold text-zinc-950 dark:text-white tracking-tight pt-4 border-t border-zinc-100 dark:border-zinc-800/60"
        >
          {{ para.replace('## ', '') }}
        </h2>

        <!-- Heading 1 -->
        <h3
          v-else-if="para.startsWith('# ')"
          :id="para.replace('# ', '').toLowerCase().replace(/[^a-z0-9]+/g, '-')"
          class="text-2xl font-bold text-zinc-950 dark:text-white tracking-tight"
        >
          {{ para.replace('# ', '') }}
        </h3>

        <!-- Table -->
        <div v-else-if="para.includes('| :--- |')" class="my-6 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table class="w-full text-left text-xs font-mono">
            <tbody>
              <tr
                v-for="(row, rIdx) in para.split('\n')"
                :key="rIdx"
                :class="rIdx === 0 ? 'bg-zinc-100 dark:bg-zinc-900 font-bold border-b border-zinc-200 dark:border-zinc-800' : 'border-b border-zinc-100 dark:border-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/40'"
              >
                <td
                  v-for="(cell, cIdx) in row.split('|').filter(c => c.trim().length > 0)"
                  :key="cIdx"
                  class="p-3"
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
        <p v-else class="text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {{ para }}
        </p>
      </div>
    </article>

    <!-- Next & Previous Navigation Footer -->
    <div class="pt-10 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
      <div>
        <NuxtLink
          v-if="prevDoc"
          :to="`/docs/${prevDoc.slug}`"
          class="flex flex-col p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-left group"
        >
          <span class="text-[11px] font-mono text-zinc-400 group-hover:text-cyan-500 flex items-center gap-1">
            <UIcon name="i-lucide-arrow-left" class="w-3.5 h-3.5" /> Previous
          </span>
          <span class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
            {{ prevDoc.title }}
          </span>
        </NuxtLink>
      </div>

      <div>
        <NuxtLink
          v-if="nextDoc"
          :to="`/docs/${nextDoc.slug}`"
          class="flex flex-col p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-right group"
        >
          <span class="text-[11px] font-mono text-zinc-400 group-hover:text-cyan-500 flex items-center justify-end gap-1">
            Next <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5" />
          </span>
          <span class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
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
