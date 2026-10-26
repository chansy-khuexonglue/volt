<script setup lang="ts">
defineProps<{
  toc: { id: string; text: string; depth?: number }[];
}>();

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  }
}
</script>

<template>
  <div v-if="toc && toc.length > 0" class="w-56 shrink-0 hidden xl:block sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pl-4 pb-12 select-none">
    <div class="space-y-3">
      <div class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        <UIcon name="i-lucide-list" class="w-3.5 h-3.5 text-cyan-500" />
        <span>On this page</span>
      </div>

      <ul class="space-y-1.5 border-l border-zinc-200 dark:border-zinc-800 text-xs">
        <li v-for="item in toc" :key="item.id">
          <button
            @click="scrollToSection(item.id)"
            class="block w-full text-left pl-3 py-1 text-zinc-600 dark:text-zinc-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors line-clamp-1"
          >
            {{ item.text }}
          </button>
        </li>
      </ul>

      <!-- Community & edit on GitHub -->
      <div class="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
        <a
          href="https://github.com/chansy-khuexonglue/volt"
          target="_blank"
          class="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          <UIcon name="i-lucide-github" class="w-3.5 h-3.5" />
          <span>Edit this page on GitHub</span>
        </a>
        <a
          href="https://github.com/chansy-khuexonglue/volt/issues"
          target="_blank"
          class="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          <UIcon name="i-lucide-message-square" class="w-3.5 h-3.5" />
          <span>Report an issue</span>
        </a>
      </div>
    </div>
  </div>
</template>
