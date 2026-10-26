<script setup>
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk}`
      : "Volt - High-Performance Bun API Framework";
  },
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { name: "theme-color", content: "#06b6d4" },
  ],
  link: [
    { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
  ],
  htmlAttrs: {
    lang: "en",
  },
});
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
