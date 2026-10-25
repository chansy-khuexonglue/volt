# ⚡ Volt Routing Guide

Volt features a hybrid routing architecture combining an **O(1) static lookup table** for fixed routes with an optimized **Radix Trie** for parameter-matching and wildcard routes.

## Static Routes

Static routes resolve in $O(1)$ constant time:

```typescript
app.get('/health', () => ({ status: 'ok' }));
app.post('/auth/login', handleLogin);
```

## Dynamic Parameters

Named route parameters are prefixed with `:` and automatically inferred in TypeScript:

```typescript
app.get('/users/:id', (c) => {
  // c.params.id is strictly typed as string
  return { userId: c.params.id };
});
```

Multiple parameters can be extracted along the path:

```typescript
app.get('/orgs/:orgId/projects/:projectId', (c) => {
  return {
    org: c.params.orgId,
    project: c.params.projectId,
  };
});
```

## Wildcards

Wildcards (`*`) capture everything remaining in the path:

```typescript
app.get('/assets/*', (c) => {
  return { filePath: c.params.wildcard };
});
```

## Route Groups

Organize endpoints by prefix and shared middleware using `app.group()`:

```typescript
app.group('/api/v1', (v1) => {
  v1.get('/status', () => ({ version: '1.0' }));

  v1.group('/users', (users) => {
    users.get('/', listUsers);
    users.get('/:id', getUser);
  });
});
```

## Conflict Detection

Volt strictly verifies routes at registration time to prevent ambiguous route collisions (e.g. adding both `/items/:id` and `/items/:itemId` under the same method throws `RouteConflictError`).
