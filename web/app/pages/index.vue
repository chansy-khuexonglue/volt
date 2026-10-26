<script setup lang="ts">
useSeoMeta({
  title: 'Volt - High-Performance TypeScript-first API Framework built for Bun',
  description: 'The ultra-fast, modern API framework for Bun. Radix Tree routing, Dependency Injection, automatic type coercion, and first-class Prisma ORM integration.',
  ogTitle: 'Volt - High-Performance TypeScript API Framework',
  ogDescription: 'Experience 180,000+ requests per second with sub-millisecond p99 latency on Bun.',
});

const activeInstallTab = ref<'bun' | 'pnpm' | 'npm'>('bun');
const installCommands = {
  bun: 'bun add volt',
  pnpm: 'pnpm add volt',
  npm: 'npm install volt',
};

const copied = ref(false);
async function copyCommand() {
  await navigator.clipboard.writeText(installCommands[activeInstallTab.value]);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

const quickstartCode = `import { Volt, cors, logger, prismaPlugin } from 'volt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = new Volt({ port: 3000 });

// Global middlewares & official plugins
app.use(logger({ format: 'dev' }));
app.use(cors());
app.plugin(prismaPlugin({ client: prisma }));

// O(1) Radix tree route with type-safe context
app.get('/api/users/:id', async (c) => {
  const user = await c.store.prisma.user.findUnique({
    where: { id: c.params.id },
  });
  if (!user) return c.json({ error: 'User not found' }, 404);
  return c.json({ success: true, user });
});

app.listen(() => {
  console.log('⚡ Volt server running on http://localhost:3000');
});`;
</script>

<template>
  <div class="relative overflow-hidden">
    <!-- Ambient glowing backdrop effect -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 overflow-hidden">
      <div class="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[750px] h-[400px] bg-gradient-to-tr from-cyan-500/20 via-sky-500/15 to-transparent blur-[120px] rounded-full" />
    </div>

    <!-- Hero Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
      <div class="text-center space-y-6 max-w-4xl mx-auto">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono font-medium text-cyan-600 dark:text-cyan-400 select-none shadow-sm">
          <span class="flex h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
          <span>⚡ Volt v0.1.0 Released</span>
          <span class="text-zinc-400 dark:text-zinc-600">•</span>
          <span class="text-zinc-700 dark:text-zinc-300">Engineered for Bun</span>
        </div>

        <!-- Headline -->
        <h1 class="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.08]">
          The High-Performance API Framework for
          <span class="bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 bg-clip-text text-transparent">
            Modern Bun
          </span>
        </h1>

        <!-- Subheading -->
        <p class="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Sub-millisecond p99 latency, zero-allocation Radix routing, enterprise Dependency Injection, and first-class Prisma ORM integration.
        </p>

        <!-- CTA & Quick Install Box -->
        <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink
            to="/docs/introduction"
            class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 group active:scale-95"
          >
            <span>Explore Documentation</span>
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </NuxtLink>

          <NuxtLink
            to="/benchmarks"
            class="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
          >
            <UIcon name="i-lucide-gauge" class="w-4 h-4 text-cyan-500" />
            <span>View Benchmarks</span>
          </NuxtLink>
        </div>

        <!-- Terminal Install Selector -->
        <div class="pt-6 max-w-md mx-auto">
          <div class="flex items-center justify-center gap-2 mb-2">
            <button
              v-for="pkg in (['bun', 'pnpm', 'npm'] as const)"
              :key="pkg"
              @click="activeInstallTab = pkg"
              class="px-2.5 py-1 rounded text-xs font-mono font-medium transition-all"
              :class="activeInstallTab === pkg ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/30' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'"
            >
              {{ pkg }}
            </button>
          </div>

          <div
            @click="copyCommand"
            class="group cursor-pointer flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-mono shadow-xl hover:border-zinc-700 transition-all select-none"
          >
            <div class="flex items-center gap-2">
              <span class="text-cyan-400 font-bold">$</span>
              <span>{{ installCommands[activeInstallTab] }}</span>
            </div>
            <span class="text-zinc-500 group-hover:text-cyan-400 flex items-center gap-1">
              <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" class="w-3.5 h-3.5" />
              <span>{{ copied ? 'Copied' : 'Copy' }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Hero Code Preview & Benchmark Teaser Grid -->
      <div class="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div class="lg:col-span-7">
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-mono text-zinc-500 px-1">
              <span class="flex items-center gap-1.5">
                <UIcon name="i-lucide-code-2" class="w-4 h-4 text-cyan-500" />
                <span>Modern, Idiomatic TypeScript API</span>
              </span>
              <span>Bun native HTTP</span>
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
    <section class="border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div class="text-center space-y-3 max-w-2xl mx-auto">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-cyan-500">
            Engineered for Modern Systems
          </h2>
          <h3 class="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Why High-Throughput Teams Choose Volt
          </h3>
          <p class="text-sm text-zinc-600 dark:text-zinc-400">
            A thoughtful architecture that does not force you to sacrifice code clarity for raw execution speed.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Pillar 1 -->
          <div class="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm hover:shadow-md transition-all space-y-3">
            <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <UIcon name="i-lucide-zap" class="w-5 h-5" />
            </div>
            <h4 class="text-base font-bold text-zinc-900 dark:text-zinc-100">
              184,000+ Requests / sec
            </h4>
            <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Direct integration with Bun's C++ native HTTP engine bypasses Node.js legacy event loops, producing sub-millisecond p99 latencies.
            </p>
          </div>

          <!-- Pillar 2 -->
          <div class="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm hover:shadow-md transition-all space-y-3">
            <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <UIcon name="i-lucide-split" class="w-5 h-5" />
            </div>
            <h4 class="text-base font-bold text-zinc-900 dark:text-zinc-100">
              O(1) Radix Tree Router
            </h4>
            <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Static endpoints resolve via instant hash lookups, while dynamic parameters (<code class="code-inline">:id</code>) and wildcards match in a compressed prefix tree.
            </p>
          </div>

          <!-- Pillar 3 -->
          <div class="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm hover:shadow-md transition-all space-y-3">
            <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <UIcon name="i-simple-icons-prisma" class="w-5 h-5" />
            </div>
            <h4 class="text-base font-bold text-zinc-900 dark:text-zinc-100">
              First-Class Prisma Plugin
            </h4>
            <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Official <code class="code-inline">@volt/plugin-prisma</code> provides context store injection (<code class="code-inline">c.store.prisma</code>), automated P2002 error translation, and graceful connection teardown.
            </p>
          </div>

          <!-- Pillar 4 -->
          <div class="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm hover:shadow-md transition-all space-y-3">
            <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <UIcon name="i-lucide-layers" class="w-5 h-5" />
            </div>
            <h4 class="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Built-in Dependency Injection
            </h4>
            <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              NestJS-style modular architecture with <code class="code-inline">@Injectable()</code>, Singleton & Transient scopes, and circular dependency protection without the performance penalty.
            </p>
          </div>

          <!-- Pillar 5 -->
          <div class="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm hover:shadow-md transition-all space-y-3">
            <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <UIcon name="i-lucide-book-open" class="w-5 h-5" />
            </div>
            <h4 class="text-base font-bold text-zinc-900 dark:text-zinc-100">
              OpenAPI 3.1 & Swagger
            </h4>
            <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Generates OpenAPI specs automatically from validation schemas and serves live interactive Swagger UI and Scalar UI documentation out of the box.
            </p>
          </div>

          <!-- Pillar 6 -->
          <div class="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm hover:shadow-md transition-all space-y-3">
            <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <UIcon name="i-lucide-shield-check" class="w-5 h-5" />
            </div>
            <h4 class="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Automatic Type Coercion
            </h4>
            <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              No more manual <code class="code-inline">parseInt()</code> or boolean parsing. Query strings like <code class="code-inline">?limit=20&active=true</code> are automatically coerced into strictly-typed numbers and booleans.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive Live Sandbox Teaser -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 class="text-xs font-semibold uppercase tracking-wider text-cyan-500">
            Interactive Test Drive
          </h2>
          <h3 class="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight mt-1">
            Experience Volt's Speed in Your Browser
          </h3>
          <p class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Test live routes, inspect type-safe responses, and measure response times.
          </p>
        </div>

        <NuxtLink
          to="/playground"
          class="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-cyan-500 hover:text-cyan-400 transition-colors"
        >
          <span>Open Fullscreen Playground</span>
          <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5" />
        </NuxtLink>
      </div>

      <ApiPlayground />
    </section>

    <!-- Bottom CTA -->
    <section class="border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-950 text-white py-16 relative overflow-hidden">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h3 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Ready to Build Ultra-Fast APIs?
        </h3>
        <p class="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
          Start building production services in seconds with Volt, Bun, and TypeScript.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-4 pt-2">
          <NuxtLink
            to="/docs/quick-start"
            class="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            Get Started in 60 Seconds
          </NuxtLink>
          <a
            href="https://github.com/chansy-khuexonglue/volt"
            target="_blank"
            class="px-6 py-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold text-sm transition-all flex items-center gap-2"
          >
            <UIcon name="i-simple-icons-github" class="w-4 h-4" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
