<script setup lang="ts">
const { refreshCart } = useCart();

onMounted(() => {
  refreshCart();
});
</script>

<template>
  <UApp>
    <div class="min-h-screen flex flex-col bg-neutral-50/30 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans">
      <Navbar />

      <main class="flex-1">
        <NuxtPage />
      </main>

      <Footer />

      <CartDrawer />
    </div>
  </UApp>
</template>
