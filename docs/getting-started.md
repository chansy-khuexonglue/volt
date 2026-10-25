# 🚀 Getting Started with Volt

Volt is a high-performance, TypeScript-first API framework built natively for **Bun**. It compiles route trees, validation schemas, and middleware pipelines at startup to deliver sub-millisecond latencies and over 350,000 req/s.

## Installation

Volt requires Bun 1.4 or later:

```bash
bun add volt
```

## Quick Start (Minimal Server)

Create an `index.ts` file:

```typescript
import { Volt } from 'volt';

const app = new Volt({ port: 3000 });

app.get('/', () => ({
  message: '⚡ Welcome to Volt!',
}));

app.listen(3000, (server) => {
  console.log(`⚡ Server running at http://localhost:${server.port}`);
});
```

Run your server with hot-reload:

```bash
bun --watch index.ts
```

## Core Highlights

- **Native Bun Speed**: Built directly on `Bun.serve` with zero unnecessary object allocations.
- **Radix & O(1) Routing**: Static routes use an O(1) hash table; dynamic routes use a radix tree with typed parameters.
- **Precompiled Validation (`t`)**: Fast schema builder with compile-time type inference (`Static<typeof schema>`).
- **Interactive Documentation**: Built-in OpenAPI 3.1 generator with interactive Swagger UI and Scalar UI.
- **Official Middleware Suite**: CORS, Rate Limiting, Security Headers, Structured Logging, Timeouts, and HTTP Caching.
- **Production Security**: Native Web Crypto JWT authentication, payload size guards, and safe error masking.
