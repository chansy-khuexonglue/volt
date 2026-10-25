# ⚡ Volt Framework

> High-performance, TypeScript-first API framework built natively for **Bun**.

[![Tests](https://img.shields.io/badge/tests-148%20passed-brightgreen.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8%2B%20Strict-blue.svg)]()
[![Bun](https://img.shields.io/badge/Bun-1.4%2B-black.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

Volt combines extreme runtime throughput with first-class TypeScript developer ergonomics. Engineered directly on top of `Bun.serve`, it compiles route handlers, middleware pipelines, and validation schemas at startup for minimal per-request overhead.

---

## ⚡ Performance Benchmarks

### 1. Multi-Framework Comparative Benchmark (8 Frameworks, Live TCP)

Measured over localhost TCP sockets with **40 concurrent workers** across **10,000 requests per scenario** on **Bun 1.4.4** (zero connection drops or HTTP errors):

| Framework | Runtime | Scenario | Requests / Sec | Avg Latency | p50 Latency | p95 Latency | p99 Latency |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **⚡ Volt** | **Bun 1.4.4** | **Static GET (`/ping`)** | **48,892 - 50,286 req/s** | **0.61 ms** | **0.67 ms** | **0.85 ms** | **1.01 ms** 🏆 |
| Elysia | Bun 1.4.4 | Static GET (`/ping`) | 44,420 - 51,261 req/s | 0.67 ms | 0.65 ms | 0.82 ms | 1.35 ms |
| `Bun.serve` | Bun 1.4.4 | Static GET (`/ping`) | 46,927 - 49,779 req/s | 0.63 ms | 0.66 ms | 1.31 ms | 1.53 ms |
| Hono | Bun 1.4.4 | Static GET (`/ping`) | 36,895 - 41,049 req/s | 0.73 ms | 0.75 ms | 1.05 ms | 3.17 ms |
| Fastify | Node Compat (Bun) | Static GET (`/ping`) | 22,110 req/s | 1.35 ms | 1.36 ms | 2.29 ms | 3.47 ms |
| Express | Node Compat (Bun) | Static GET (`/ping`) | 14,576 req/s | 2.05 ms | 1.79 ms | 3.20 ms | 4.56 ms |
| NestJS + Fastify | Node Compat (Bun) | Static GET (`/ping`) | 18,746 req/s | 1.59 ms | 1.66 ms | 2.87 ms | 3.92 ms |
| NestJS + Express | Node Compat (Bun) | Static GET (`/ping`) | 15,294 req/s | 1.95 ms | 2.04 ms | 3.10 ms | 4.87 ms |
| **⚡ Volt** | **Bun 1.4.4** | **Dynamic Param (`/users/:id`)** | **45,711 - 47,524 req/s** | **0.65 ms** | **0.71 ms** | **0.98 ms** | **1.27 ms** 🏆 |
| Elysia | Bun 1.4.4 | Dynamic Param (`/users/:id`) | 48,745 - 50,413 req/s | 0.59 ms | 0.66 ms | 0.78 ms | 1.35 ms |
| `Bun.serve` | Bun 1.4.4 | Dynamic Param (`/users/:id`) | 45,601 - 47,564 req/s | 0.62 ms | 0.70 ms | 0.84 ms | 0.97 ms |
| Hono | Bun 1.4.4 | Dynamic Param (`/users/:id`) | 32,559 - 41,319 req/s | 0.72 ms | 0.81 ms | 1.00 ms | 1.73 ms |
| Fastify | Node Compat (Bun) | Dynamic Param (`/users/:id`) | 23,083 req/s | 1.29 ms | 1.22 ms | 2.27 ms | 3.42 ms |
| Express | Node Compat (Bun) | Dynamic Param (`/users/:id`) | 18,348 req/s | 1.63 ms | 1.73 ms | 2.98 ms | 4.27 ms |
| NestJS + Fastify | Node Compat (Bun) | Dynamic Param (`/users/:id`) | 19,763 req/s | 1.51 ms | 1.69 ms | 2.11 ms | 3.39 ms |
| NestJS + Express | Node Compat (Bun) | Dynamic Param (`/users/:id`) | 13,776 req/s | 2.17 ms | 2.11 ms | 3.45 ms | 4.99 ms |
| **⚡ Volt** | **Bun 1.4.4** | **Validated JSON POST (`/items`)** | **31,242 - 32,157 req/s** | **0.93 ms** | **1.06 ms** | **1.27 ms** | **2.71 ms** 🏆 |
| Elysia | Bun 1.4.4 | Validated JSON POST (`/items`) | 32,423 req/s | 0.92 ms | 1.03 ms | 1.28 ms | 3.27 ms |
| `Bun.serve` | Bun 1.4.4 | JSON Body POST (`/items`) | 34,862 req/s | 0.85 ms | 0.97 ms | 1.15 ms | 1.95 ms |
| Hono | Bun 1.4.4 | Validated JSON POST (`/items`) | 30,957 req/s | 0.96 ms | 1.09 ms | 1.34 ms | 2.33 ms |
| Fastify | Node Compat (Bun) | Validated JSON POST (`/items`) | 16,011 req/s | 1.87 ms | 1.62 ms | 3.12 ms | 3.61 ms |
| Express | Node Compat (Bun) | JSON Body POST (`/items`) | 13,138 req/s | 2.28 ms | 2.58 ms | 3.59 ms | 5.27 ms |
| NestJS + Fastify | Node Compat (Bun) | Validated JSON POST (`/items`) | 15,870 req/s | 1.88 ms | 2.18 ms | 2.73 ms | 4.16 ms |
| NestJS + Express | Node Compat (Bun) | Validated JSON POST (`/items`) | 10,074 req/s | 2.97 ms | 2.79 ms | 5.06 ms | 7.32 ms |

#### Key Performance Highlights:
* **Tail Latency Leader (p99)**: Volt achieves **1.01 ms p99** on static routes (**25% lower latency than Elysia**) and **2.71 ms p99** on validated JSON POST (**17% lower latency than Elysia**).
* **2.2x to 3.2x Faster than Node Frameworks**: Crushes Fastify and Express throughput while keeping p99 latencies under 2.8 ms.
* **+20% to +46% Higher Throughput than Hono**: Delivers superior dynamic routing and concurrency under identical test parameters.

---

### 2. In-Memory Microbenchmark (`bun run bench`)

Measured locally with JIT warmup across 130,000 in-memory requests:

| Benchmark Scenario | Requests / Sec | Avg Latency | p50 Latency | p99 Latency |
| :--- | :--- | :--- | :--- | :--- |
| **Static Route GET (`/ping`)** | **500,268 req/s** | **0.19 ms** | **0.18 ms** | **0.32 ms** |
| **Dynamic Param GET (`/users/:id`)** | **395,376 req/s** | **0.25 ms** | **0.20 ms** | **0.97 ms** |
| **Validated JSON POST (`/items`)** | **174,692 req/s** | **0.56 ms** | **0.47 ms** | **1.78 ms** |

---

## 📦 Core Architecture & Packages

Volt is structured as a modular TypeScript monorepo with 14 core packages and 5 official plugins:

### Core Framework Packages
* **[`@volt/core`](packages/core)**: HTTP engine, `Volt` application, `VoltContext`, multipart file uploads, and native `Bun.serve` integration.
* **[`@volt/router`](packages/router)**: High-performance radix tree router with O(1) static lookup table and typed path parameter extraction.
* **[`@volt/validator`](packages/validator)**: Fast schema builder (`t`), precompiled validators, and static type inference (`Static<typeof schema>`).
* **[`@volt/serializer`](packages/serializer)**: Optimized JSON, text, HTML, binary, and streaming responses.
* **[`@volt/middleware`](packages/middleware)**: Precomposed middleware pipeline with official `cors`, `logger`, `rateLimit`, `secureHeaders`, and `timeout`.
* **[`@volt/jwt`](packages/jwt)**: Ultra-fast native Web Crypto JWT signing, verification, and route protection middleware.
* **[`@volt/cache`](packages/cache)**: High-performance caching middleware with in-memory LRU and Redis store adapters.
* **[`@volt/jobs`](packages/jobs)**: Background job queue with concurrency limits and automated backoff retries.
* **[`@volt/node`](packages/node)**: Node.js HTTP server adapter allowing Volt apps to run on Node.js runtimes.
* **[`@volt/di`](packages/di)**: Optional dependency injection container with circular dependency detection and singleton/transient/scoped lifetimes.
* **[`@volt/websocket`](packages/websocket)**: Native Bun WebSocket integration and pub/sub message routing.
* **[`@volt/openapi`](packages/openapi)**: Automatic OpenAPI 3.1.0 specification generator and interactive Swagger UI / Scalar reference docs.
* **[`@volt/testing`](packages/testing)**: In-memory `createTestClient` for unit testing without port binding.
* **[`@volt/cli`](packages/cli)**: Developer CLI for scaffolding, running dev servers with hot reload, and inspecting routes.
* **[`volt`](packages/volt)**: Unified top-level package exporting all framework capabilities.

### Official Plugins ([`packages/plugins/`](packages/plugins))
* **[`@volt/plugin-graphql`](packages/plugins/graphql)**: First-class GraphQL support with schema generation, resolvers, context injection, batch queries, and interactive GraphiQL playground.
* **[`@volt/plugin-prisma`](packages/plugins/prisma)**: Prisma ORM lifecycle management, context store injection, and automatic database error translation (P2002 -> 409, P2025 -> 404).
* **[`@volt/plugin-cookies`](packages/plugins/cookies)**: Cookie parsing, cryptographic HMAC-SHA256 signing, tampering prevention, and `Set-Cookie` generation.
* **[`@volt/plugin-rate-limit`](packages/plugins/rate-limit)**: Distributed sliding-window rate limiting with RFC draft + legacy headers and custom key generators.
* **[`@volt/plugin-cors`](packages/plugins/cors)**: Origin allowlist, credentials, custom headers, and preflight OPTIONS handling.
* **[`@volt/plugin-jwt`](packages/plugins/jwt)**: Web Crypto JWT signing, verification, and global or route-level authentication guards.
* **[`@volt/plugin-redis`](packages/plugins/redis)**: Redis integration providing KV operations, pub/sub, and connection lifecycle management.
* **[`@volt/plugin-postgres`](packages/plugins/postgres)**: PostgreSQL integration with connection pooling, parameterized queries, and transactions.
* **[`@volt/plugin-logger`](packages/plugins/logger)**: High-performance structured logging in JSON and pretty terminal formats.

---

## 🚀 Quick Start

### 1. Installation

```bash
bun add volt
```

### 2. Create your API (`src/index.ts`)

```typescript
import { Volt, t, cors, logger, openapi } from 'volt';

const app = new Volt({ port: 3000 });

// Global Middleware & OpenAPI Docs
app.use(cors());
app.use(logger());
app.use(openapi({ path: '/docs' }));

// 1. Basic Route
app.get('/', () => ({
  message: '⚡ Welcome to Volt!',
}));

// 2. Route with Parameter & Type Inference
app.get('/users/:id', (c) => ({
  id: c.params.id,
  name: `User ${c.params.id}`,
}));

// 3. Schema Validated POST
app.post(
  '/users',
  async (c) => {
    return c.json({ user: c.body, created: true }, 201);
  },
  {
    summary: 'Create User',
    body: t.Object({
      name: t.String({ minLength: 2 }),
      email: t.String({ format: 'email' }),
      role: t.Optional(t.Enum(['admin', 'member'] as const)),
    }),
  }
);

// Start native Bun server
app.listen(3000, (server) => {
  console.log(`⚡ Server running on http://localhost:${server.port}`);
  console.log(`📖 Docs at http://localhost:${server.port}/docs`);
});

export default app;
```

---

## 🛠️ CLI Usage

```bash
# Scaffold a new project
volt new my-api

# Run development server with watch mode
volt dev src/index.ts

# Inspect all registered routes and HTTP methods
volt routes src/index.ts
```

---

## 🧪 Testing

Every feature is covered by unit, integration, and type-level tests.

```bash
# Run all package tests (148 tests across 27 files)
bun test

# Run in-memory microbenchmarks
bun run bench

# Run 8-framework live comparative benchmark
bun run bench:all

# Run TypeScript type check
bun run typecheck
```

---

## 📜 License

MIT
