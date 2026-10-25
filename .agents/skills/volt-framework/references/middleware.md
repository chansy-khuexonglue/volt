# Middleware and context

Support global, group, and route middleware with predictable order and short-circuit responses. Compose chains once per route at startup when practical. Allow sync and async execution and ensure thrown errors reach the central handler.

Expose native request plus lazy helpers for params/query/headers/body and response builders. Avoid shared mutable request context. Test short-circuit, exception propagation, nested groups, async ordering, and state isolation under concurrent requests.
