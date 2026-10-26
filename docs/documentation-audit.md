# Volt documentation audit

This audit checked the documentation against the repository implementation and the live documentation site on 27 October 2026 (Asia/Bangkok).

## Coverage and corrections

The web documentation now contains 38 pages and 30 self-contained application samples. The deployment article remains removed.

| Area | Finding | Documentation change |
| --- | --- | --- |
| Getting started | Setup and runnable examples were split across fragments | Complete install, application, run, curl, expected response, and testing steps |
| Context | `c.header()` was not implemented; headers are native Headers | Examples use `setHeader`, `getHeader`, and `headers.get` |
| Validation | Zod-style signatures and `minimum` did not match Volt | Use `(path, handler, schema, middleware[])`, built-in `t`, and `min`/`max` |
| Type inference | Body and query inference was overstated | Explain explicit `Static<typeof Schema>` types and current coercion limits |
| Middleware | Examples discarded `next()` responses | Return the response and register middleware before routes |
| Lifecycle | Nonexistent request hook APIs were listed | Document `onStart`, `onStop`, `onError`, and asynchronous startup limits |
| DI/modules | Examples assumed automatic constructor wiring and a module class | Explicit dependency providers and `ModuleConfig` composition |
| JWT/cookies | Helpers and protection APIs were misnamed | Full token and signed-cookie flows with error cases |
| PostgreSQL/Redis | Defaults were described as real driver connections | Identify mock/memory defaults and provide real-driver adapter recipes |
| OpenAPI | Version defaults and response enforcement were unclear | Set 3.1 explicitly and distinguish metadata from runtime validation |
| Missing guides | No testing, errors, upload, stream, cache, job, or runtime examples | Add complete guides, package coverage, troubleshooting, and runtime boundaries |
| Rendering/navigation | Blank lines split fenced code; links/tables were plain text; sidebar disappeared on mobile | Shared safe Markdown parser, copyable blocks, derived TOC, native mobile navigation |
| Benchmark claims | Static numbers were presented as verified/live telemetry | Replace rankings with checked-in commands and measurement methodology |
| Sandbox | Preset responses and artificial delays were presented as live results | Clearly label presets and remove simulated server latency |

## Framework issues exposed by the audit

These are documented boundaries, not runtime changes made by this documentation PR:

- `c.store` is shared application state. Per-request identity should stay in local variables; built-in JWT and context-bound helpers require care.
- Credentialed CORS can reflect a rejected origin. Do not rely on the allowlist alone with credentials enabled.
- POST/PUT/PATCH validation does not follow the GET query/parameter coercion branch.
- `plugin.setup()` and the startup hook are invoked without awaiting asynchronous results.
- `app.ws()` uses a placeholder manager. The guide supplies explicit Bun server wiring and adapts the manager error callback to Bun's argument order.
- The PostgreSQL plugin uses a mock without an injected client; Redis uses a memory implementation without an injected client. URL options alone do not establish connections.
- JobQueue is in memory and its stop method does not drain active work. Response schemas describe OpenAPI contracts but are not enforced on outgoing data.

## Comparison sources

The comparison concerns API/documentation coverage, not a speed ranking:

- [Elysia Quick Start](https://elysiajs.com/quick-start): runnable setup, essentials, patterns, testing, and WebSocket learning paths.
- [Hono documentation](https://hono.dev/docs/): separates API reference from middleware, testing, validation, streaming, and runtime guides.
- [Fastify reference](https://fastify.dev/docs/latest/Reference/): separates guides from server, request/reply, hooks, plugins, and schema reference.
- [node-postgres transactions](https://node-postgres.com/features/transactions) and [node-redis guide](https://redis.io/docs/latest/develop/clients/nodejs/): primary references for the real-client adapter recipes.

## Verification

- All 30 self-contained examples are imported from the displayed code and pass strict TypeScript checking.
- 16 documentation tests cover CRUD, bad input, headers, middleware, OpenAPI, JWT, cookies, rate limits, caching, file uploads, streams, GraphQL, DI, mock clients, and a real WebSocket echo connection.
- Web typechecking, root framework typechecking, and the Nuxt production build pass locally.
- The existing framework suite passed 102 tests. Two Fastify benchmark network tests fail in this container with `getifaddrs returned an error`; their source is unchanged by this PR.
- Real PostgreSQL, Redis, and Prisma recipes require external services and have not been exercised against those services here.
- The rebuilt Bun server returned HTTP 200 for all 38 docs pages and 5 site/asset URLs; all generated anchors and mobile navigation were present. Removed/unknown docs returned 404.
- Real Redis and PostgreSQL adapter recipes pass strict TypeScript checks against their driver types.
- The npm package-content filter was corrected to avoid a malformed regular expression; it accepts source and rejects examples/web content.
- Docker is unavailable locally. Both Dockerfiles now use the verified Bun lockfile and run web typechecking before building; GitHub CI builds the actual image.
