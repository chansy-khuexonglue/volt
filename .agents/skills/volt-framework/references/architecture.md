# Architecture

Bun-first, TypeScript-only core. Use `Bun.serve({fetch})` and web-standard `Request`/`Response`. Keep `@volt/core` small; isolate router, validation, serialization, DI, and plugins in separate packages when separation yields value.

Request path: Bun server -> method/path match -> precomposed middleware -> optional schema validation -> handler -> serialization -> Response. Route registration and schema compilation happen at startup, not for every request. Preserve request-local state and avoid shared mutable context.

Design interfaces before implementation: `Volt`, `RouteDefinition`, `Handler`, `Context`, `Middleware`, `Plugin`, `HttpError`. Support async handlers and direct `Response` returns. Error handling must catch rejected promises without exposing secrets. Use feature detection for runtime-specific capabilities.

Design for Bun first; future Node support is optional and should use an adapter rather than polluting the core hot path.
