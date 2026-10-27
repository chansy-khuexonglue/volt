# Volt CLI

Create a project and select a template in the terminal:

```bash
bunx --bun --package @voltts/cli volt new my-api
```

Choose **api** for a modular REST starter with configuration, health and users modules, validation, OpenAPI, tests and a Dockerfile. Its sample data is stored in memory. Choose **minimal** for a small application and tests.

For scripts, select explicitly:

```bash
bunx --bun --package @voltts/cli volt new my-api --template api
bunx --bun --package @voltts/cli volt new hello --template minimal
```

Run `bun install`, `bun run dev`, and `bun test` inside the new directory. The CLI refuses existing directories. Use `bun run routes` to list registered routes.
