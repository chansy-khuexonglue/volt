<script setup lang="ts">
import { parseInline } from '../utils/docsMarkdown';
const props = defineProps<{ text: string }>();
const tokens = computed(() => parseInline(props.text));
</script>

<template>
  <template v-for="(token, index) in tokens" :key="index">
    <code v-if="token.kind === 'code'" class="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9em] text-primary-700 dark:bg-neutral-800 dark:text-primary-300">{{ token.text }}</code>
    <strong v-else-if="token.kind === 'strong'" class="font-semibold text-neutral-950 dark:text-white">{{ token.text }}</strong>
    <NuxtLink v-else-if="token.kind === 'link' && token.href?.startsWith('/')" :to="token.href" class="text-primary-600 underline underline-offset-4 hover:text-primary-700 dark:text-primary-400">{{ token.text }}</NuxtLink>
    <a v-else-if="token.kind === 'link'" :href="token.href" class="text-primary-600 underline underline-offset-4 hover:text-primary-700 dark:text-primary-400">{{ token.text }}</a>
    <template v-else>{{ token.text }}</template>
  </template>
</template>
