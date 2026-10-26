<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-500">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
