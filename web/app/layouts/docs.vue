<template>
  <div class="min-h-screen flex flex-col bg-neutral-50/40 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans antialiased selection:bg-primary-500/20 selection:text-primary-500">
    <AppHeader />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full pt-8 pb-16">
      <div class="flex items-start gap-8">
        <!-- Left: Documentation Navigation Sidebar -->
        <DocsSidebar />

        <!-- Middle: Main Article Content Slot -->
        <main class="flex-1 min-w-0 max-w-3xl">
          <slot />
        </main>

        <!-- Right: Table of Contents & Community Slot -->
        <slot name="toc" />
      </div>
    </div>

    <AppFooter />
  </div>
</template>
