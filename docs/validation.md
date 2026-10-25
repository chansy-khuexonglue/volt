# 📐 Validation & Type Inference

Volt provides a built-in schema validator (`t`) that precompiles validation rules at server boot, preventing per-request schema construction overhead.

## Schema Types

```typescript
import { t, Static } from 'volt';

const UserSchema = t.Object({
  name: t.String({ minLength: 2, maxLength: 50 }),
  email: t.String({ format: 'email' }),
  age: t.Optional(t.Integer({ minimum: 18 })),
  role: t.Enum(['admin', 'member', 'guest'] as const),
  tags: t.Array(t.String()),
});

// Infer static TypeScript type
type User = Static<typeof UserSchema>;
```

## Route Schema Validation

Attach schemas to validate `body`, `query`, `params`, or `headers`:

```typescript
app.post(
  '/users',
  async (c) => {
    // c.body is inferred and validated
    const newUser = c.body;
    return c.json(newUser, 201);
  },
  {
    summary: 'Create User',
    body: UserSchema,
    query: t.Object({
      notify: t.Optional(t.Boolean()),
    }),
  }
);
```

When validation fails, Volt automatically short-circuits the request and returns a structured `400 Bad Request` containing detailed error locations.
