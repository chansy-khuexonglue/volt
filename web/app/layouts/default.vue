<template>
  <div class="min-h-screen flex flex-col bg-neutral-50/40 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans antialiased selection:bg-primary-500/20 selection:text-primary-500">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
