# Static route optimization

Volt can pass eligible static GET routes directly to Bun.serve.routes. Bun selects the route before calling JavaScript, avoiding Volt's URL extraction, method branch and Map lookup for that path. Handlers are still called for every request, and handlers using context, validation or middleware still execute their normal pipeline.

This is native route dispatch, not response caching. A function with no declared arguments can still read time, random values, external state or perform side effects; Volt must not execute it at startup and freeze its result.

Use `new Volt({ nativeRoutes: false })` to select the JavaScript dispatcher for comparison or compatibility. app.handle() and the Node adapter continue to use the ordinary dispatcher. The native candidate set is restricted to plain ASCII static paths; dynamic/wildcard and other paths retain the fallback. HEAD, OPTIONS and other methods are explicitly delegated to Volt's dispatcher. Bun 1.4.4 is the tested runtime.

The change also makes Promise-returning context-free handlers serialize the resolved value and routes network-dispatch exceptions through the normal error handler.

## Reproduce measurements

After installing repository dependencies:

```bash
bun benchmarks/static-native.ts
BENCH_SCENARIO=context bun benchmarks/static-native.ts
```

Set BENCH_BASELINE to the core index.ts file in a separately installed checkout to include the previous implementation (CI checks out the PR base automatically). The script runs Volt native routes, Volt's JS dispatcher, and Elysia in separate server processes from the client. It rotates order across five repetitions, warms up each process for one second, then measures two seconds at concurrency 30. The context scenario reads a request header. It checks payloads and records HTTP errors. JSON output contains the raw repetitions, CPU, architecture, runtime, scenario and settings; the console table shows median, minimum, maximum, and median P99. Repeated runs on shared machines can vary; overlapping ranges do not demonstrate a definitive speed winner.

No production-wide speed claim follows from these two GET scenarios. Database work, body validation, middleware-heavy routes, runtime/OS limits and cross-machine variance need separate measurements. The tests check per-request side effects, async results, custom errors, headers/methods, middleware, validation, path encoding and routing fallbacks.

## Research references

- [Bun routing](https://bun.sh/docs/runtime/http/routing): native route tables, dispatch and explicit static responses.
- [Elysia compiler internals](https://elysiajs.com/internal/jit-compiler): specialized request pipelines, response mapping and native Bun integration.

Useful follow-up techniques include specializing pipeline work from explicit schemas and minimizing response construction. Avoid caching function results implicitly, removing validation to improve scores, or inferring request dependencies from function arity alone. Those can change observable behavior.
