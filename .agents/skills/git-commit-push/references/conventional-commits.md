# Conventional Commits Specification for Volt

Volt follows the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) specification.

## Commit Message Format

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- **`feat`**: Introduces a new feature or capability to the codebase.
  - *Example*: `feat(validator): add automatic string-to-number type coercion`
  - *Example*: `feat(rest-api): implement full ecommerce order checkout lifecycle`
- **`fix`**: Patches a bug or unintended behavior in the codebase.
  - *Example*: `fix(core): avoid overwriting content-security-policy in swagger ui`
  - *Example*: `fix(node): handle port 0 for ephemeral testing server`
- **`docs`**: Documentation only changes (READMEs, JSDocs, Swagger specs).
  - *Example*: `docs(readme): add detailed ecommerce testing and curl endpoints guide`
- **`test`**: Adding new tests or correcting existing tests.
  - *Example*: `test(ecommerce): add 44 unit and integration tests for catalog and orders`
- **`refactor`**: Code changes that neither fix a bug nor add a feature.
  - *Example*: `refactor(router): normalize route join to prevent trailing slash collisions`
- **`perf`**: A code change that improves runtime performance or reduces allocations.
  - *Example*: `perf(compiler): optimize regex caching in schema validator`
- **`chore`**: Build process, tool updates, dependency upgrades, or repository config.
  - *Example*: `chore(git): configure github remote origin and git-commit-push skill`

### Scopes

Allowed scopes across the Volt monorepo:

| Scope | Package / Directory |
| :--- | :--- |
| `core` | `packages/core` |
| `router` | `packages/router` |
| `validator` | `packages/validator` |
| `openapi` | `packages/openapi` |
| `middleware`| `packages/middleware` |
| `di` | `packages/di` |
| `jobs` | `packages/jobs` |
| `node` | `packages/node` |
| `cli` | `packages/cli` |
| `plugin-cors` | `packages/plugins/cors` |
| `plugin-jwt` | `packages/plugins/jwt` |
| `plugin-redis` | `packages/plugins/redis` |
| `plugin-postgres` | `packages/plugins/postgres` |
| `plugin-logger` | `packages/plugins/logger` |
| `rest-api` | `examples/rest-api` |
| `benchmarks`| `benchmarks` |
| `repo` | Monorepo root / toolchains |

### Breaking Changes

Add an exclamation mark `!` after type/scope or write `BREAKING CHANGE:` in the footer:
```text
feat(core)!: redesign middleware composition pipeline

BREAKING CHANGE: middleware now requires next() to return a Promise<Response>.
```
