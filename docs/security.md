# 🔒 Production Security Guide

Volt prioritizes security and correctness over raw speed.

## JWT Authentication (`@volt/jwt`)

Volt uses the native Web Crypto API (`crypto.subtle`) for high-speed token signing and verification:

```typescript
import { sign, verify, jwt } from 'volt';

// Generate Token
const token = await sign(
  { sub: 'usr_123', role: 'admin' },
  process.env.JWT_SECRET!,
  { expiresIn: '2h', issuer: 'volt-api' }
);

// Protect Route
app.get(
  '/profile',
  (c) => ({ user: c.store.user }),
  {},
  [jwt({ secret: process.env.JWT_SECRET!, issuer: 'volt-api' })]
);
```

## Payload Limits & File Uploads

Guard against denial-of-service memory exhaustion:

```typescript
const app = new Volt({
  maxRequestBodySize: 5 * 1024 * 1024, // 5MB limit
});
```

Payloads exceeding the configured limit are rejected with `413 Payload Too Large`.

## Error Response Sanitization

In production (`development: false`), internal stack traces and database exceptions are never leaked to clients.
