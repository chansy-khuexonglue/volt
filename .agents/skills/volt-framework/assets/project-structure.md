# Suggested monorepo

```text
volt/
  packages/
    core/
    router/
    validator/
    serializer/
    middleware/
    di/
    websocket/
    openapi/
    testing/
    cli/
    plugins/
      cors/
      jwt/
      redis/
      postgres/
      logger/
  examples/
    hello-world/
    rest-api/
    authentication/
  benchmarks/
    volt/
    elysia/
    hono/
  docs/
  tests/
  package.json
  tsconfig.json
```

Start with a minimal workspace. Add packages only when a stable boundary is justified.
