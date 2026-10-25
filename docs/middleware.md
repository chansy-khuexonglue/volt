# 🛡️ Middleware Guide

Middleware in Volt can be attached globally, to route groups, or directly to specific endpoints.

## Precompiled Pipelines

At server boot, Volt flattens and precompiles all middleware functions into a single deterministic call stack.

## Official Middleware

```typescript
import { cors, logger, rateLimit, secureHeaders, timeout, cache, jwt } from 'volt';

// Global Structured Request Logging
app.use(logger());

// Cross-Origin Resource Sharing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Security Headers (CSP, HSTS, X-Frame-Options)
app.use(secureHeaders());

// Rate Limiting (in-memory sliding window)
app.use(rateLimit({
  max: 500,
  windowMs: 60_000,
}));

// Request Timeout (aborts after 5 seconds)
app.use(timeout(5000));
```

## Route-Level Middleware

Pass middleware directly into individual routes:

```typescript
app.get(
  '/admin',
  (c) => ({ secret: 'admin-data' }),
  { summary: 'Admin Route' },
  [jwt({ secret: 'my-jwt-secret' }), myCustomGuard]
);
```
