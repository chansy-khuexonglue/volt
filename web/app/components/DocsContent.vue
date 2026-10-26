<script setup lang="ts">
import { parseDocBlocks } from '../utils/docsMarkdown';
const props = defineProps<{ content: string }>();
const blocks = computed(() => parseDocBlocks(props.content));
</script>

<template>
  <article class="space-y-6 text-sm leading-7 text-neutral-700 dark:text-neutral-300">
    <template v-for="(block, index) in blocks" :key="index">
      <component :is="block.depth < 3 ? 'h2' : 'h3'" v-if="block.kind === 'heading'" :id="block.id" class="scroll-mt-24 border-t border-neutral-200 pt-6 text-xl font-bold tracking-tight text-neutral-950 dark:border-neutral-800 dark:text-white">
        <DocsInline :text="block.text" />
      </component>
      <CodeSnippet v-else-if="block.kind === 'code'" :code="block.code" :language="block.language" :filename="block.filename" />
      <div v-else-if="block.kind === 'table'" class="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table class="w-full text-left text-sm">
          <thead class="bg-neutral-100 font-semibold text-neutral-950 dark:bg-neutral-900 dark:text-white">
            <tr><th v-for="(cell, cellIndex) in block.headers" :key="cellIndex" scope="col" class="px-4 py-3"><DocsInline :text="cell" /></th></tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in block.rows" :key="rowIndex" class="border-t border-neutral-200 dark:border-neutral-800">
              <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="px-4 py-3 align-top"><DocsInline :text="cell" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <component :is="block.ordered ? 'ol' : 'ul'" v-else-if="block.kind === 'list'" class="space-y-2 pl-6" :class="block.ordered ? 'list-decimal' : 'list-disc'">
        <li v-for="(item, itemIndex) in block.items" :key="itemIndex"><DocsInline :text="item" /></li>
      </component>
      <p v-else><DocsInline :text="block.text" /></p>
    </template>
  </article>
</template>
