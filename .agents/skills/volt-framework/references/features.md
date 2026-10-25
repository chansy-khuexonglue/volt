# Features and acceptance criteria

## P0 (minimum viable framework)
- Bun HTTP server, configurable host/port, clean shutdown.
- GET/POST/PUT/PATCH/DELETE and correct 404/405/HEAD/OPTIONS behavior.
- Exact, parameter, wildcard routes; deterministic precedence and conflict errors.
- Native Response plus JSON/text helpers; headers, status, cookies where needed.
- Global, group, and route middleware with documented execution order.
- Route parameter inference and optional schema validation for body/query/params.
- Centralized errors, request-size limits, tests and benchmark harness.

## P1 (production ecosystem)
- Plugin API, CORS, JWT, secure cookies, rate limiting, logging.
- WebSocket, OpenAPI, streaming and multipart handling.
- Optional modules and dependency injection; CLI and docs.

## P2 (advanced)
- Redis/database integrations, background jobs, microservice transports, Node adapter, GraphQL integration.

Each feature requires a user-facing example, test coverage, and compatibility notes. Do not advertise proposed APIs as implemented.
