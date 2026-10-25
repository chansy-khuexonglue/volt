# Coding standards

- TypeScript strict mode, no implicit any; use `unknown` at untrusted boundaries.
- Prefer readable, stable public APIs over micro-optimizations without evidence.
- Explicit exports, consistent errors, predictable lifecycle and cleanup.
- Avoid decorators and runtime reflection in the core.
- Use native web platform types where practical.
- Keep pure router logic separate from network handling for unit tests.
- Test sync and async handlers, invalid input, exceptions, concurrency, and shutdown.
- Include migration notes for public API changes; avoid breaking semantic versions.
