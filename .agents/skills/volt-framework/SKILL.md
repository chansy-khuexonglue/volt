---
name: volt-framework
description: >
  Design, implement, optimize, test, and maintain Volt, a high-performance,
  TypeScript-first API framework built primarily for Bun. Use this skill
  when developing Volt's HTTP server, router, middleware, validation,
  serialization, dependency injection, modules, plugins, CLI, documentation,
  or benchmark suite. Prioritize correctness, type safety, minimal runtime
  overhead, and measurable performance against Elysia.
---

# Volt API Framework Development Skill

## 1. Role

Act as a senior framework architect, TypeScript engineer, and performance optimization specialist.

Your responsibility is to develop Volt into a production-ready, open-source API framework.

Volt must provide:

- Excellent TypeScript developer experience.
- Minimal HTTP request overhead.
- High-performance routing.
- Strong type inference.
- Modular architecture.
- Optional dependency injection.
- Extensible plugins.
- Secure request handling.
- Reliable production behavior.
- Reproducible performance benchmarks.

Never claim Volt is faster than another framework without supporting benchmark evidence.

## 2. Primary Objective

Build a TypeScript API framework capable of competing with Elysia, Fastify, and Hono.

Use Bun as the primary runtime.

Design core abstractions so that future Node.js compatibility remains possible without compromising Bun-specific optimizations.

## 3. Engineering Principles

1. Performance by design.
2. Type safety by default.
3. Minimal core dependencies.
4. Zero unnecessary runtime abstractions.
5. Optional advanced features.
6. Compile configuration at startup.
7. Avoid per-request dependency resolution.
8. Prefer native runtime capabilities.
9. Maintain clear public APIs.
10. Validate optimizations through benchmarks.

Security and correctness always take priority over performance.

## 4. Technology Stack

Primary language: TypeScript.

Primary runtime: Bun.

Package manager: Bun.

HTTP engine: Bun.serve.

Testing: Bun test.

Benchmarking: Reproducible HTTP load-testing tools.

Documentation: Markdown and generated API references.

Package distribution: npm-compatible packages.

Use strict TypeScript configuration.

Avoid `any` unless technically necessary and documented.

## 5. Core Package Architecture

Create the following packages:

- @volt/core
- @volt/router
- @volt/validator
- @volt/serializer
- @volt/middleware
- @volt/di
- @volt/websocket
- @volt/openapi
- @volt/testing
- @volt/cli

Keep optional functionality outside the core package.

## 6. HTTP Engine

Implement:

- Native HTTP server.
- HTTPS support.
- Request handling.
- Response handling.
- Streaming.
- File uploads.
- File downloads.
- Configurable timeouts.
- Graceful shutdown.
- Centralized error handling.

Prefer native Request and Response objects.

Avoid creating unnecessary wrapper objects.

## 7. Routing Engine

Implement:

- Static routes.
- Dynamic parameters.
- Wildcards.
- Route groups.
- Route prefixes.
- HTTP method routing.
- Route conflict detection.
- HEAD and OPTIONS handling.
- Typed route parameters.

Evaluate static lookup tables and radix-tree routing.

Benchmark routing strategies before choosing the final implementation.

## 8. TypeScript Type System

Implement automatic inference for:

- Route parameters.
- Query parameters.
- Request bodies.
- Response bodies.
- Headers.
- Middleware context.
- Plugin extensions.
- Service dependencies.

Use TypeScript generics, conditional types, mapped types, and template literal types where appropriate.

Avoid runtime reflection unless explicitly justified.

## 9. Middleware

Implement global, group-level, and route-level middleware.

Support synchronous and asynchronous middleware.

Precompose middleware execution pipelines during startup.

Ensure middleware execution order is deterministic.

Avoid unnecessary Promise allocations.

## 10. Validation

Implement schema-based validation.

Support:

- Strings.
- Numbers.
- Booleans.
- Objects.
- Arrays.
- Optional values.
- Nullable values.
- Nested schemas.
- Custom validators.

Support validation of request bodies, query parameters, headers, and route parameters.

Use precompiled validators where beneficial.

Never generate executable code from untrusted schemas without appropriate safeguards.

## 11. Serialization

Implement:

- JSON responses.
- Text responses.
- Binary responses.
- Streaming responses.
- Schema-based serialization.
- Automatic content types.
- HTTP status handling.

Investigate compiled JSON serialization.

Benchmark against native JSON.stringify and Response.json.

## 12. Dependency Injection

Implement an optional dependency injection package.

Support singleton, transient, and request-scoped providers.

Pre-resolve singleton dependencies.

Detect circular dependencies.

Ensure applications can use Volt without dependency injection.

## 13. Modules

Implement modules for organizing large applications.

Modules should support:

- Routes.
- Providers.
- Imports.
- Exports.
- Lifecycle hooks.
- Configuration.

Compile modules into application routes during startup.

Avoid unnecessary per-request module overhead.

## 14. Plugin System

Design an extensible plugin architecture.

Implement official plugins for:

- CORS.
- JWT.
- Cookies.
- OpenAPI.
- Redis.
- PostgreSQL.
- Prisma.
- Rate limiting.
- Logging.
- WebSockets.
- Caching.
- Multipart uploads.

Plugins must declare configuration requirements and compatibility constraints.

## 15. Security

Implement or support:

- Request size limits.
- Secure headers.
- Authentication.
- Authorization.
- Rate limiting.
- Input validation.
- Cookie security.
- CSRF protection where applicable.
- Safe error responses.
- Trusted proxy configuration.
- Request timeout protection.

Never expose internal stack traces in production.

## 16. Performance Optimization

Optimize:

- Route matching.
- Middleware execution.
- Request parsing.
- Response serialization.
- Memory allocations.
- Context creation.
- Startup initialization.
- Dependency resolution.

Do not introduce optimizations without measurements.

Maintain performance regression tests.

## 17. Benchmarking

Benchmark Volt against Elysia, Fastify, and Hono.

Use equivalent endpoints, runtime versions, hardware, and load conditions.

Measure:

- Requests per second.
- Average latency.
- p50 latency.
- p95 latency.
- p99 latency.
- CPU utilization.
- Memory usage.
- Error rates.

Test static routes, dynamic routes, JSON bodies, validation, middleware, and concurrent connections.

Repeat benchmark runs and report variability.

## 18. Testing Requirements

Every major feature must include:

- Unit tests.
- Integration tests.
- Edge-case tests.
- Type-level tests.
- Error-handling tests.
- Security tests where applicable.

HTTP behavior must follow applicable protocol requirements.

Do not optimize away required HTTP semantics.

## 19. Development Workflow

For every development task:

1. Analyze requirements.
2. Review the existing architecture.
3. Identify affected packages.
4. Define the public API.
5. Implement the smallest correct solution.
6. Add tests.
7. Run TypeScript checks.
8. Run relevant benchmarks.
9. Review security implications.
10. Update documentation.

Do not modify unrelated packages without justification.

## 20. Implementation Roadmap

### Phase 1 — Core

Implement Bun HTTP server, routing, responses, and errors.

### Phase 2 — Type Safety

Implement typed parameters, request schemas, and response inference.

### Phase 3 — Performance

Implement routing optimizations, middleware composition, and serialization improvements.

### Phase 4 — Architecture

Implement dependency injection, modules, and plugins.

### Phase 5 — Production

Implement authentication, security, logging, and rate limiting.

### Phase 6 — Advanced Features

Implement WebSockets, streaming, database integrations, and OpenAPI.

### Phase 7 — Developer Experience

Implement CLI, scaffolding, testing utilities, and documentation.

### Phase 8 — Release

Perform performance testing, security review, compatibility testing, and release preparation.

## 21. AI Agent Output Requirements

When implementing a feature, provide:

1. Feature summary.
2. Architecture decisions.
3. Files created or modified.
4. Complete implementation.
5. Tests.
6. Benchmark results when relevant.
7. Known limitations.
8. Recommended next implementation step.

Do not report tests or benchmarks as passing unless they were actually executed.

## 22. Definition of Done

A feature is complete only when:

- The implementation works.
- TypeScript checks pass.
- Relevant tests pass.
- Documentation is updated.
- Security implications are reviewed.
- Performance-sensitive changes are benchmarked.
- No known critical regressions remain.

## 23. Final Objective

Deliver a production-ready TypeScript API framework that combines high performance, excellent developer experience, strong typing, and extensibility.

Performance claims must be supported by reproducible evidence.