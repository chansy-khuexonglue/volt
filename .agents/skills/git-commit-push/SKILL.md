---
name: git-commit-push
description: >-
  Automate staging, conventional commits, and pushing code to GitHub for the
  Volt repository (https://github.com/chansy-khuexonglue/volt.git). Use this skill
  whenever committing changes, pushing code to GitHub, formatting conventional commit
  messages, creating release commits, setting up git remotes, or running pre-push verification.
---

# Git Commit & Push Workflow for Volt

A standardized skill and automated workflow for committing and pushing code safely to GitHub:
`https://github.com/chansy-khuexonglue/volt.git`.

---

## 1. Quick Start Execution

You can run the interactive or automated push script provided in this skill:

```bash
# Push with automated pre-flight checks and message
./.agents/skills/git-commit-push/scripts/push.sh "feat(ecommerce): add full ecommerce rest-api example and query coercion"

# Or check status and branch health
./.agents/skills/git-commit-push/scripts/status.sh
```

---

## 2. Standard Manual Procedure

### Step 1: Pre-flight Verification (Quality Gate)
Always ensure tests and types are 100% clean before committing:
```bash
# Verify TypeScript types across the monorepo
bun run typecheck

# Verify test suite
bun test
```

### Step 2: Ensure Remote & Branch Configuration
Ensure the remote URL points to the official repository and the branch is set to `main`:
```bash
# Verify remote origin
git remote -v

# If remote is missing or incorrect, set it:
git remote add origin https://github.com/chansy-khuexonglue/volt.git
# Or update existing:
git remote set-url origin https://github.com/chansy-khuexonglue/volt.git

# Ensure current branch is 'main'
git branch -M main
```

### Step 3: Review Changes & Sensitive Files
Check for unintended files or secrets:
```bash
# Review porcelain status
git status -s

# Ensure .env, keys, and credentials are NOT in git tracking
# Check .gitignore covers sensitive files
```

### Step 4: Stage Files
Stage intended modifications and new files:
```bash
# Stage all files according to .gitignore
git add .

# Or stage selectively
git add packages/ examples/ README.md
```

### Step 5: Conventional Commit Message
Volt enforces the [Conventional Commits](https://www.conventionalcommits.org/) format:

```text
<type>(<scope>): <short description in present tense>

[optional body explaining motivation and context]

[optional footer(s) like Closes #123]
```

#### Commit Types
| Type | Description | Example |
| :--- | :--- | :--- |
| `feat` | New feature or capability | `feat(validator): add automatic query parameter type coercion` |
| `fix` | Bug fix or issue resolution | `fix(core): preserve CSP headers when serving swagger UI` |
| `docs` | Documentation updates | `docs(readme): add ecommerce architecture and curl guides` |
| `test` | Adding or updating tests | `test(rest-api): add 44 ecommerce unit and integration tests` |
| `refactor`| Code restructuring without feature change | `refactor(router): normalize join for trailing slash routes` |
| `perf` | Performance optimization | `perf(router): accelerate static radix lookups` |
| `chore` | Maintenance, dependencies, config | `chore(repo): configure github origin and git skill` |

#### Volt Recognized Scopes
- `core`, `router`, `validator`, `openapi`, `middleware`, `di`, `jobs`, `node`, `cli`
- `plugin-cors`, `plugin-jwt`, `plugin-redis`, `plugin-postgres`, `plugin-logger`
- `rest-api`, `benchmarks`, `docs`, `repo`

### Step 6: Commit and Push
```bash
# Commit
git commit -m "feat(scope): concise description"

# Push to GitHub with upstream tracking
git push -u origin main
```

---

## 3. GitHub Authentication

When pushing via HTTPS (`https://github.com/...`):
- GitHub requires a **Personal Access Token (Classic or Fine-Grained)** with `repo` permissions, or the GitHub CLI:
  ```bash
  # Authenticate with GitHub CLI
  gh auth login
  ```
- Alternatively, switch remote to SSH if SSH keys are installed:
  ```bash
  git remote set-url origin git@github.com:chansy-khuexonglue/volt.git
  git push -u origin main
  ```
See [GitHub Authentication Guide](./references/github-auth.md) for full details.

---

## 4. Helper Scripts Reference

- [scripts/push.sh](./scripts/push.sh): Automated runner that validates typecheck + tests, stages files, prompts or accepts commit message, and pushes to `origin`.
- [scripts/status.sh](./scripts/status.sh): Clean diagnostic dashboard of working directory, staging area, remotes, and branch status.
- [references/conventional-commits.md](./references/conventional-commits.md): Detailed cheat sheet for writing clear commit messages.
- [references/github-auth.md](./references/github-auth.md): Setup instructions for GitHub Personal Access Tokens and SSH keys.
