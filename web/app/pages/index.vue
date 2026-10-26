<script setup lang="ts">
useSeoMeta({
  title: 'Volt - High-Performance TypeScript-first API Framework built for Bun',
  description: 'The ultra-fast, modern API framework for Bun. Radix Tree routing, Dependency Injection, automatic type coercion, and first-class Prisma ORM integration.',
  ogTitle: 'Volt - High-Performance TypeScript API Framework',
  ogDescription: 'Build TypeScript APIs with routing, validation, middleware, and practical tutorials on Bun.',
});

const installPkgOptions = ['bun', 'pnpm', 'npm'] as const;
type PkgManager = typeof installPkgOptions[number];
const activeInstallTab = ref<PkgManager>('bun');
const installCommands: Record<PkgManager, string> = {
  bun: 'bun add voltts',
  pnpm: 'pnpm add voltts',
  npm: 'npm install voltts',
};

const copied = ref(false);
async function copyCommand() {
  await navigator.clipboard.writeText(installCommands[activeInstallTab.value]);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

const quickstartCode = `import { Volt, t } from 'voltts';

const app = new Volt({ port: 3000 });
app.get('/hello', () => ({ message: 'Hello Volt' }));
app.post('/tasks', (c) => c.json(c.body, 201), {
  body: t.Object({ title: t.String({ minLength: 2 }) }),
});
app.listen(3000);`;
</script>

<template>
  <div class="relative overflow-hidden tech-grid">
    <!-- Ambient subtle glow -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none -z-10 overflow-hidden">
      <div class="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-primary-500/10 blur-[130px] rounded-full" />
    </div>

    <!-- Hero Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 md:pt-20 md:pb-24">
      <div class="text-center space-y-6 max-w-4xl mx-auto">
        <!-- Telemetry Pill Badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 text-white dark:bg-neutral-900 dark:text-neutral-200 border border-neutral-800 text-[11px] font-mono select-none shadow-sm">
          <span class="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span class="font-bold text-primary-400">VOLT ARCHITECTURE</span>
          <span class="text-neutral-600">■</span>
          <span>BUN HTTP SERVER</span>
          <span class="text-neutral-600">■</span>
          <span class="text-neutral-400">TYPESCRIPT API FRAMEWORK</span>
        </div>

        <!-- Headline -->
        <h1 class="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.08]">
          The High-Performance API Framework for
          <span class="text-primary-500 underline decoration-primary-500/30 underline-offset-8">
            Modern Bun
          </span>
        </h1>

        <!-- Subheading -->
        <p class="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Build APIs with routing, request validation, middleware, OpenAPI, and explicit service composition. Start with a complete example and add integrations as you need them.
        </p>

        <!-- CTA & Quick Install Box -->
        <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink
            to="/docs/quick-start"
            class="w-full sm:w-auto px-6 py-3 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-bold text-xs uppercase tracking-wider font-mono transition-all shadow-sm flex items-center justify-center gap-2 group active:scale-95"
          >
            <span>Build your first API</span>
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4 text-primary-500 group-hover:translate-x-1 transition-transform" />
          </NuxtLink>

          <NuxtLink
            to="/benchmarks"
            class="w-full sm:w-auto px-6 py-3 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold text-xs uppercase tracking-wider font-mono transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
          >
            <UIcon name="i-lucide-gauge" class="w-4 h-4 text-primary-500" />
            <span>Telemetry & Benchmarks</span>
          </NuxtLink>
        </div>

        <p class="text-sm text-neutral-500">Install with Bun, save the example below as index.ts, then run <code>bun run index.ts</code>.</p>
        <NuxtLink to="/docs/tutorial-crud" class="inline-block text-primary-600 underline underline-offset-4 dark:text-primary-400">Follow the complete Tasks API tutorial →</NuxtLink>
        <!-- Terminal Install Selector -->
        <div class="pt-4 max-w-md mx-auto">
          <div class="flex items-center justify-center gap-2 mb-2 font-mono">
            <button
              v-for="pkg in installPkgOptions"
              :key="pkg"
              @click="activeInstallTab = pkg"
              class="px-2.5 py-0.5 rounded text-xs transition-all uppercase"
              :class="activeInstallTab === pkg ? 'bg-primary-500/10 text-primary-500 border border-primary-500/30 font-bold' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'"
            >
              {{ pkg }}
            </button>
          </div>

          <div
            @click="copyCommand"
            class="group cursor-pointer flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs font-mono shadow-sm hover:border-neutral-700 transition-all select-none"
          >
            <div class="flex items-center gap-2">
              <span class="text-primary-400 font-bold">$</span>
              <span>{{ installCommands[activeInstallTab] }}</span>
            </div>
            <span class="text-neutral-500 group-hover:text-primary-400 flex items-center gap-1">
              <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" class="w-3.5 h-3.5" />
              <span>{{ copied ? 'Copied' : 'Copy' }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Hero Code Preview & Benchmark Teaser Grid -->
      <div class="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div class="lg:col-span-7">
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-mono text-neutral-500 px-1">
              <span class="flex items-center gap-1.5 font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                <UIcon name="i-lucide-code-2" class="w-4 h-4 text-primary-500" />
                <span>Idiomatic TypeScript Core</span>
              </span>
              <span class="uppercase">Bun Serve Engine</span>
            </div>
            <CodeSnippet :code="quickstartCode" language="typescript" filename="server.ts" />
          </div>
        </div>

        <div class="lg:col-span-5 space-y-6">
          <BenchmarkChart />
        </div>
      </div>
    </section>

    <!-- Key Architectural Pillars -->
    <section class="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-950/70 py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div class="text-center space-y-3 max-w-2xl mx-auto">
          <div class="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-primary-500">
            ENGINEERED FOR EXTREME SCALE
          </div>
          <h2 class="text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            High-Throughput Architectural Pillars
          </h2>
          <p class="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-sans">
            A thoughtful architecture that does not force you to sacrifice code maintainability for raw execution speed.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Pillar 1 -->
          <div class="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:border-primary-500/40 transition-all space-y-3 group">
            <div class="w-10 h-10 rounded-lg bg-neutral-900 text-white dark:bg-neutral-800 dark:text-primary-400 flex items-center justify-center font-mono font-bold text-sm">
              01
            </div>
            <h3 class="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors uppercase font-mono">
              Native Bun HTTP
            </h3>
            <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
              Volt registers routes on Bun's native HTTP server. Measure your own workload with the repository's checked-in benchmark scripts.
            </p>
          </div>

          <!-- Pillar 2 -->
          <div class="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:border-primary-500/40 transition-all space-y-3 group">
            <div class="w-10 h-10 rounded-lg bg-neutral-900 text-white dark:bg-neutral-800 dark:text-primary-400 flex items-center justify-center font-mono font-bold text-sm">
              02
            </div>
            <h3 class="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors uppercase font-mono">
              O(1) Radix Tree Router
            </h3>
            <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
              Static endpoints resolve via instant hash lookups, while dynamic parameters (<code class="code-inline">:id</code>) and wildcards match in a compressed prefix tree.
            </p>
          </div>

          <!-- Pillar 3 -->
          <div class="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:border-primary-500/40 transition-all space-y-3 group">
            <div class="w-10 h-10 rounded-lg bg-neutral-900 text-white dark:bg-neutral-800 dark:text-primary-400 flex items-center justify-center font-mono font-bold text-sm">
              03
            </div>
            <h3 class="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors uppercase font-mono">
              Prisma ORM Plugin
            </h3>
            <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
              Official <code class="code-inline">@voltts/plugin-prisma</code> provides context store injection (<code class="code-inline">c.store.prisma</code>), automated P2002 error translation, and graceful connection teardown.
            </p>
          </div>

          <!-- Pillar 4 -->
          <div class="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:border-primary-500/40 transition-all space-y-3 group">
            <div class="w-10 h-10 rounded-lg bg-neutral-900 text-white dark:bg-neutral-800 dark:text-primary-400 flex items-center justify-center font-mono font-bold text-sm">
              04
            </div>
            <h3 class="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors uppercase font-mono">
              Built-in Dependency Injection
            </h3>
            <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
              Compose services with explicit providers and <code class="code-inline">Container</code>, singleton and transient lifetimes, and circular dependency detection.
            </p>
          </div>

          <!-- Pillar 5 -->
          <div class="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:border-primary-500/40 transition-all space-y-3 group">
            <div class="w-10 h-10 rounded-lg bg-neutral-900 text-white dark:bg-neutral-800 dark:text-primary-400 flex items-center justify-center font-mono font-bold text-sm">
              05
            </div>
            <h3 class="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors uppercase font-mono">
              OpenAPI & Swagger
            </h3>
            <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
              Generates OpenAPI specifications automatically from validation schemas and serves interactive Swagger UI and Scalar UI documentation out of the box.
            </p>
          </div>

          <!-- Pillar 6 -->
          <div class="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:border-primary-500/40 transition-all space-y-3 group">
            <div class="w-10 h-10 rounded-lg bg-neutral-900 text-white dark:bg-neutral-800 dark:text-primary-400 flex items-center justify-center font-mono font-bold text-sm">
              06
            </div>
            <h3 class="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors uppercase font-mono">
              Automatic Type Coercion
            </h3>
            <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
              With a GET query schema, strings like <code class="code-inline">?limit=20&active=true</code> can be validated and coerced into numbers and booleans. See the coercion guide for current method restrictions.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive Live Sandbox Teaser -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div class="text-[11px] font-mono font-bold uppercase tracking-wider text-primary-500">
            INTERACTIVE SYSTEM TEST
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight mt-1">
            Explore API Request and Response Shapes
          </h2>
          <p class="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-sans">
            Explore preset responses in the browser, then run the documented examples locally to test real HTTP behavior.
          </p>
        </div>

        <NuxtLink
          to="/playground"
          class="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-primary-500 hover:text-primary-600 uppercase tracking-wider transition-colors"
        >
          <span>Open Full Sandbox</span>
          <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5" />
        </NuxtLink>
      </div>

      <ApiPlayground />
    </section>

    <!-- Bottom CTA -->
    <section class="border-t border-neutral-200 dark:border-neutral-800 bg-black text-white py-16 relative overflow-hidden">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Ready to build your first API?
        </h2>
        <p class="text-neutral-400 text-xs sm:text-sm max-w-xl mx-auto font-sans leading-relaxed">
          Follow a runnable tutorial, verify its responses, and add tests as you build.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-4 pt-2 font-mono">
          <NuxtLink
            to="/docs/quick-start"
            class="px-6 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95"
          >
            Start the tutorial
          </NuxtLink>
          <a
            href="https://github.com/chansy-khuexonglue/volt"
            target="_blank"
            class="px-6 py-3 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <UIcon name="i-simple-icons-github" class="w-4 h-4" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
