# Performance and benchmarking

Goal: compete with Elysia on specified workloads, not promise universal superiority.

Benchmark Volt vs Elysia (and optionally Hono/Fastify) using equivalent route behavior, Bun version, machine, concurrency, HTTP keep-alive, payloads, middleware, validation, and logging settings. Include static JSON, dynamic params, request JSON parsing, validated payload, middleware chain, large response, and concurrent load.

Warm up, run multiple trials, report median and variance. Record requests/sec, p50/p95/p99 latency, CPU, RSS memory, errors, and environment. Keep fixtures and commands committed. Avoid optimizing only trivial hello-world benchmarks. If a change improves throughput but harms tail latency or correctness, report both.
