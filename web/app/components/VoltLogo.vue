<template>
  <div class="flex items-center gap-2.5 font-bold tracking-tight select-none">
    <div class="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 shadow-md shadow-cyan-500/30 text-white font-mono">
      <svg class="w-5 h-5 fill-current text-white drop-shadow" viewBox="0 0 24 24">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
      <div class="absolute inset-0 rounded-lg ring-1 ring-white/30" />
    </div>
    <div class="flex items-baseline gap-1.5">
      <span class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-950 dark:from-white dark:via-zinc-100 dark:to-zinc-300 bg-clip-text text-transparent">
        VOLT
      </span>
      <span class="text-[10px] font-mono uppercase font-semibold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
        v0.1.0
      </span>
    </div>
  </div>
</template>
