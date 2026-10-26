<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    code: string;
    language?: string;
    filename?: string;
  }>(),
  {
    language: 'typescript',
    filename: '',
  }
);

const copied = ref(false);

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy', err);
  }
}
</script>

<template>
  <div class="relative group my-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-neutral-100 overflow-hidden shadow-sm">
    <!-- Header bar -->
    <div class="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 text-xs font-mono text-neutral-400">
      <div class="flex items-center gap-2">
        <span class="flex gap-1.5 mr-1">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
        </span>
        <span v-if="filename" class="text-neutral-200 font-semibold ml-1">{{ filename }}</span>
        <span v-else class="text-neutral-500 uppercase tracking-wider text-[11px]">{{ language }}</span>
      </div>

      <button
        type="button"
        @click="copyCode"
        class="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium transition-all bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700/60 active:scale-95 cursor-pointer"
        :title="copied ? 'Copied!' : 'Copy to clipboard'"
      >
        <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" class="w-3.5 h-3.5 text-primary-400" />
        <span>{{ copied ? 'Copied' : 'Copy' }}</span>
      </button>
    </div>

    <!-- Code Block Body -->
    <div class="p-4 overflow-x-auto text-[13px] leading-relaxed font-mono text-neutral-200 selection:bg-primary-500/30">
      <pre><code>{{ code }}</code></pre>
    </div>
  </div>
</template>
