# Multi-machine HTTP benchmark

Run `bun benchmarks/matrix/run.ts` from the repository root after `bun install --frozen-lockfile`.

The GitHub workflow runs Linux x64 (Ubuntu 22.04/24.04), Linux ARM64, Windows x64, and macOS ARM64. These are shared hosted runners, not controlled dedicated machines; CPU model and architecture are recorded. Do not combine raw throughput across runners into a universal ranking.

Each framework server runs in a separate Bun process from the client, one server at a time. Framework order rotates across three repetitions. Four scenarios (static GET, parameter GET, small JSON POST, 16 KiB JSON POST) run at concurrency 10 and 100, with warmup and a two-second measurement per case in CI. `results.json` records hardware, runtimes, settings, counts, errors and p50/p95/p99. `summary.md` reports median and min/max throughput across repeats. Request and response bodies are consumed.

This retains the repository's framework-specific endpoints: POST schema validation is enabled for Volt, Elysia and Fastify, while Hono, Bun.serve, Express and Nest endpoints only parse JSON. All run under Bun, including Node compatibility; this is not a native Node runtime comparison or database benchmark. Client and server share a runner CPU. Use dedicated load generators and longer runs before making production claims.

Settings: `BENCH_SECONDS`, `BENCH_REPEATS`, `BENCH_CONCURRENCY` (comma-separated), `BENCH_FRAMEWORKS`, and `BENCH_OUTPUT`. A smoke run with a very short duration checks execution only and is not a performance result.
