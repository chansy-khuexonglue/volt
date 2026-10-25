# ⚡ Volt Framework

> High-performance, TypeScript-first API framework built natively for **Bun**.

[![Tests](https://img.shields.io/badge/tests-70%20passed-brightgreen.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8%2B%20Strict-blue.svg)]()
[![Bun](https://img.shields.io/badge/Bun-1.4%2B-black.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

Volt combines extreme runtime throughput with first-class TypeScript developer ergonomics. Engineered directly on top of `Bun.serve`, it compiles route handlers, middleware pipelines, and validation schemas at startup for minimal per-request overhead.

---

## ⚡ Performance Highlights

Measured locally on Bun 1.4.4 (zero errors across 130,000+ requests):

| Benchmark Scenario | Requests / Sec | Avg Latency | p50 Latency | p99 Latency |
| :--- | :--- | :--- | :--- | :--- |
| **Static Route GET (`/ping`)** | **350,676 req/s** | **0.28 ms** | **0.24 ms** | **1.05 ms** |
| **Dynamic Param GET (`/users/:id`)** | **274,001 req/s** | **0.36 ms** | **0.31 ms** | **1.20 ms** |
| **Validated JSON POST (`/items`)** | **161,526 req/s** | **0.61 ms** | **0.53 ms** | **1.62 ms** |

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
# Run all package tests
bun test

# Run benchmarks
bun run bench

# Run TypeScript type check
bun run typecheck
```

---

## 📜 License

MIT
