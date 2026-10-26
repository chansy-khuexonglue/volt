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
  <div v-if="toc && toc.length > 0" class="w-56 shrink-0 hidden xl:block sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pl-4 pb-12 select-none font-mono text-xs">
    <div class="space-y-3">
      <div class="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        <UIcon name="i-lucide-list" class="w-3.5 h-3.5 text-primary-500" />
        <span>Contents</span>
      </div>

      <ul class="space-y-1.5 border-l border-neutral-200 dark:border-neutral-800 text-[11px]">
        <li v-for="item in toc" :key="item.id">
          <button
            @click="scrollToSection(item.id)"
            class="block w-full text-left pl-3 py-1 text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors line-clamp-1"
          >
            {{ item.text }}
          </button>
        </li>
      </ul>

      <!-- Community & links -->
      <div class="pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-2 text-[11px]">
        <a
          href="https://github.com/chansy-khuexonglue/volt"
          target="_blank"
          class="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
        >
          <UIcon name="i-simple-icons-github" class="w-3.5 h-3.5" />
          <span>Edit on GitHub</span>
        </a>
        <a
          href="https://github.com/chansy-khuexonglue/volt/issues"
          target="_blank"
          class="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
        >
          <UIcon name="i-lucide-message-square" class="w-3.5 h-3.5" />
          <span>Report Issue</span>
        </a>
      </div>
    </div>
  </div>
</template>
