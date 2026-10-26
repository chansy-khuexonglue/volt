/**
 * File templates used by `volt init` / `volt new` and `volt generate`.
 *
 * Every template is a pure function returning file contents so that it can be
 * unit-tested without touching the filesystem.
 */
import { camelCase, kebabCase, pascalCase, singular } from './names';

export const VOLT_VERSION = '0.1.0';

export type TemplateName = 'api' | 'minimal';
export const TEMPLATES: Record<TemplateName, string> = {
  api: 'Modular REST API: config, modules, validation, OpenAPI docs, tests, Dockerfile',
  minimal: 'Single-file app with one route and a test',
};

/** Marker comments that `volt generate module` uses to auto-register modules. */
export const IMPORTS_MARKER = '// volt:imports';
export const MODULES_MARKER = '// volt:modules';

export interface ProjectContext {
  /** npm package name. */
  name: string;
  template: TemplateName;
}

/** Relative path -> file contents. */
export type FileMap = Record<string, string>;

// ─────────────────────────────────────────────────────────────────────────────
// Shared project files
// ─────────────────────────────────────────────────────────────────────────────

function packageJson(ctx: ProjectContext): string {
  const pkg = {
    name: ctx.name,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'bun --watch src/index.ts',
      start: 'NODE_ENV=production bun src/index.ts',
      build: 'bun build src/index.ts --target bun --outdir dist --minify',
      test: 'bun test',
      typecheck: 'tsc --noEmit',
      routes: 'volt routes src/app.ts',
    },
    dependencies: {
      voltts: `^${VOLT_VERSION}`,
    },
    devDependencies: {
      '@voltts/cli': `^${VOLT_VERSION}`,
      '@types/bun': 'latest',
      typescript: '^5.8.0',
    },
  };
  return JSON.stringify(pkg, null, 2) + '\n';
}

function tsconfigJson(): string {
  const tsconfig = {
    compilerOptions: {
      target: 'ESNext',
      module: 'ESNext',
      moduleResolution: 'bundler',
      lib: ['ESNext', 'DOM', 'DOM.Iterable'],
      strict: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      noImplicitOverride: true,
      isolatedModules: true,
      esModuleInterop: true,
      resolveJsonModule: true,
      forceConsistentCasingInFileNames: true,
      skipLibCheck: true,
      noEmit: true,
    },
    include: ['src', 'test'],
  };
  return JSON.stringify(tsconfig, null, 2) + '\n';
}

const gitignore = `# dependencies
node_modules/

# build output
dist/
out/

# environment
.env
.env.*
!.env.example

# logs & caches
*.log
coverage/
.cache/

# OS / editor
.DS_Store
.idea/
.vscode/*
!.vscode/extensions.json
`;

function envFile(template: TemplateName): string {
  const base = `# Server
# NODE_ENV is set by the scripts (\`start\` -> production, \`bun test\` -> test).
# NODE_ENV=development
HOST=0.0.0.0
PORT=3000
`;
  if (template === 'minimal') return base;
  return `${base}
# Security
CORS_ORIGIN=*
# Maximum request body size in bytes (1 MB)
MAX_BODY_SIZE=1048576

# API documentation (/docs, /openapi.json). Defaults to off in production.
ENABLE_DOCS=true
`;
}

function readme(ctx: ProjectContext): string {
  const structure =
    ctx.template === 'api'
      ? `
## Project structure

\`\`\`
src/
├── index.ts               # Entry point: starts the server, graceful shutdown
├── app.ts                 # createApp(): middleware, error handling, routes
├── config/
│   └── env.ts             # Typed environment configuration
└── modules/
    ├── health/            # GET /health
    └── users/             # Example CRUD resource (/api/users)
        ├── users.module.ts    # Routes
        ├── users.schema.ts    # Validation schemas + inferred types
        └── users.service.ts   # Business logic (in-memory store)
test/                      # bun:test integration tests
\`\`\`

## Add a feature module

Copy the users module and register your routes in \`src/app.ts\`.

## API docs

With \`ENABLE_DOCS=true\` (default outside production):

- Scalar UI: http://localhost:3000/docs
- OpenAPI spec: http://localhost:3000/openapi.json
`
      : '';

  return `# ${ctx.name}

API built with [Volt](https://github.com/chansy-khuexonglue/volt) ⚡, a high-performance
TypeScript framework for [Bun](https://bun.sh).

## Getting started

\`\`\`bash
bun install
bun run dev
\`\`\`

The server starts at http://localhost:3000.

## Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| \`bun run dev\`       | Start the dev server with hot reload     |
| \`bun run start\`     | Start in production mode                 |
| \`bun run build\`     | Bundle to \`dist/\`                        |
| \`bun test\`          | Run tests                                |
| \`bun run typecheck\` | Type-check with \`tsc\`                    |
| \`bun run routes\`    | List all registered routes               |
${structure}`;
}

const dockerfile = `FROM oven/bun:1-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY package.json bun.lock* ./
RUN bun install --production

COPY tsconfig.json ./
COPY src ./src

USER bun
EXPOSE 3000
CMD ["bun", "src/index.ts"]
`;

const dockerignore = `node_modules
dist
.git
.env
.env.*
!.env.example
test
*.log
`;

// ─────────────────────────────────────────────────────────────────────────────
// Minimal template
// ─────────────────────────────────────────────────────────────────────────────

function minimalFiles(ctx: ProjectContext): FileMap {
  return {
    'src/app.ts': `import { t, Volt } from 'voltts';

export function createApp(): Volt {
  const app = new Volt({ development: process.env.NODE_ENV !== 'production' });

  app.get('/', () => ({ message: '⚡ Hello from ${ctx.name}!' }));

  app.get(
    '/hello/:name',
    (c) => ({ message: \`Hello, \${c.params.name}!\` }),
    { params: t.Object({ name: t.String({ minLength: 1, maxLength: 50 }) }) }
  );

  return app;
}

export default createApp();
`,
    'src/index.ts': `import { createApp } from './app';

const port = Number(process.env.PORT) || 3000;
const app = createApp();

app.listen(port, (server) => {
  console.log(\`⚡ Volt server ready at http://localhost:\${server.port}\`);
});

const shutdown = async () => {
  await app.stop();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
`,
    'test/app.test.ts': `import { describe, expect, it } from 'bun:test';
import { createTestClient } from 'voltts';
import { createApp } from '../src/app';

const client = createTestClient(createApp());

describe('app', () => {
  it('GET / responds with a greeting', async () => {
    const res = await client.get('/');
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveProperty('message');
  });

  it('GET /hello/:name greets by name', async () => {
    const res = await client.get('/hello/volt');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ message: 'Hello, volt!' });
  });
});
`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// API template
// ─────────────────────────────────────────────────────────────────────────────

function apiFiles(ctx: ProjectContext): FileMap {
  return {
    'src/config/env.ts': `/**
 * Typed, validated environment configuration.
 * Bun loads \`.env\` automatically; see \`.env.example\` for available keys.
 */
function int(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProduction = nodeEnv === 'production';

export const env = {
  nodeEnv,
  isProduction,
  isTest: nodeEnv === 'test',
  host: process.env.HOST ?? '0.0.0.0',
  port: int(process.env.PORT, 3000),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  maxBodySize: int(process.env.MAX_BODY_SIZE, 1024 * 1024),
  enableDocs: bool(process.env.ENABLE_DOCS, !isProduction),
} as const;
`,
    'src/app.ts': `import { cors, HttpError, logger, openapi, secureHeaders, Volt } from 'voltts';
import { env } from './config/env';
import { healthModule } from './modules/health/health.module';
import { usersModule } from './modules/users/users.module';
${IMPORTS_MARKER}

/**
 * Builds the application without starting the server, so it can be reused by
 * tests (\`createTestClient(createApp())\`) and tooling (\`volt routes\`).
 */
export function createApp(): Volt {
  const app = new Volt({
    port: env.port,
    hostname: env.host,
    development: !env.isProduction,
    maxRequestBodySize: env.maxBodySize,
  });

  // ── Global middleware ──────────────────────────────────────────────────────
  if (!env.isTest) {
    app.use(logger({ format: env.isProduction ? 'json' : 'dev' }));
  }
  app.use(cors({ origin: env.corsOrigin }));
  app.use(secureHeaders());

  // ── API documentation ──────────────────────────────────────────────────────
  if (env.enableDocs) {
    app.use(
      openapi({
        info: { title: '${ctx.name}', version: '0.1.0' },
        path: '/docs',
        specPath: '/openapi.json',
      })
    );
  }

  // ── Error handling ─────────────────────────────────────────────────────────
  app.onError((error) => {
    if (error instanceof HttpError) {
      return error.toResponse();
    }
    console.error(error);
    return Response.json(
      { status: 500, error: 'InternalServerError', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  });

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.get('/', () => ({ name: '${ctx.name}', status: 'ok' }), {
    tags: ['Health'],
    summary: 'API information',
  });
  app.group('/health', healthModule);
  app.group('/api/users', usersModule);
  ${MODULES_MARKER}

  return app;
}

export default createApp();
`,
    'src/index.ts': `import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.port, (server) => {
  console.log(\`⚡ Volt server ready at http://localhost:\${server.port}\`);
  if (env.enableDocs) {
    console.log(\`📚 API docs at http://localhost:\${server.port}/docs\`);
  }
});

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(\`\\n\${signal} received, shutting down gracefully...\`);
  await app.stop();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
`,
    'src/modules/health/health.module.ts': `import type { RouteGroup } from 'voltts';

const startedAt = Date.now();

/** Liveness endpoint, mounted at \`/health\`. */
export function healthModule(group: RouteGroup): void {
  group.get(
    '/',
    () => ({
      status: 'ok',
      uptime: Math.round((Date.now() - startedAt) / 1000),
      timestamp: new Date().toISOString(),
    }),
    { tags: ['Health'], summary: 'Liveness probe' }
  );
}
`,
    ...resourceFiles('users'),
    'test/app.test.ts': `import { describe, expect, it } from 'bun:test';
import { createTestClient } from 'voltts';
import { createApp } from '../src/app';

const client = createTestClient(createApp());

describe('app', () => {
  it('GET / returns API info', async () => {
    const res = await client.get('/');
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe('ok');
  });

  it('GET /health reports ok', async () => {
    const res = await client.get('/health');
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe('ok');
  });

  it('returns 404 for unknown routes', async () => {
    const res = await client.get('/does-not-exist');
    expect(res.status).toBe(404);
  });
});
`,
    Dockerfile: dockerfile,
    '.dockerignore': dockerignore,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Resource module (used by the api template and `volt generate module`)
// ─────────────────────────────────────────────────────────────────────────────

export interface ResourceNames {
  /** Directory / file / URL segment, e.g. `blog-posts`. */
  kebab: string;
  /** Identifier prefix, e.g. `blogPosts`. */
  camel: string;
  /** Plural type-ish label, e.g. `BlogPosts`. */
  pascal: string;
  /** Singular entity type, e.g. `BlogPost`. */
  entity: string;
  /** Human label for OpenAPI tags, e.g. `Blog Posts`. */
  label: string;
}

export function resourceNames(name: string): ResourceNames {
  const kebab = kebabCase(name);
  const pascal = pascalCase(name);
  return {
    kebab,
    camel: camelCase(name),
    pascal,
    entity: pascalCase(singular(kebab)),
    label: kebab
      .split('-')
      .map((w) => w[0]!.toUpperCase() + w.slice(1))
      .join(' '),
  };
}

export function resourceFiles(name: string): FileMap {
  const n = resourceNames(name);
  const dir = `src/modules/${n.kebab}`;
  const entityLower = n.entity[0]!.toLowerCase() + n.entity.slice(1);

  return {
    [`${dir}/${n.kebab}.schema.ts`]: `import { t, type Static } from 'voltts';

export const ${n.entity}Schema = t.Object({
  id: t.String({ format: 'uuid' }),
  name: t.String({ minLength: 1, maxLength: 100 }),
  createdAt: t.String(),
  updatedAt: t.String(),
});

export const Create${n.entity}Schema = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
});

export const Update${n.entity}Schema = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
});

export const ${n.entity}ParamsSchema = t.Object({
  id: t.String({ format: 'uuid' }),
});

export type ${n.entity} = Static<typeof ${n.entity}Schema>;
export type Create${n.entity}Input = Static<typeof Create${n.entity}Schema>;
export type Update${n.entity}Input = Static<typeof Update${n.entity}Schema>;
`,
    [`${dir}/${n.kebab}.service.ts`]: `import { NotFoundError } from 'voltts';
import type { Create${n.entity}Input, ${n.entity}, Update${n.entity}Input } from './${n.kebab}.schema';

/**
 * ${n.label} business logic.
 * Uses an in-memory store; swap it for a database (Postgres, Prisma, ...) in production.
 */
export class ${n.pascal}Service {
  private readonly items = new Map<string, ${n.entity}>();

  list(): ${n.entity}[] {
    return [...this.items.values()];
  }

  get(id: string): ${n.entity} {
    const ${entityLower} = this.items.get(id);
    if (!${entityLower}) {
      throw new NotFoundError(\`${n.entity} \${id} not found\`);
    }
    return ${entityLower};
  }

  create(input: Create${n.entity}Input): ${n.entity} {
    const now = new Date().toISOString();
    const ${entityLower}: ${n.entity} = {
      id: crypto.randomUUID(),
      name: input.name,
      createdAt: now,
      updatedAt: now,
    };
    this.items.set(${entityLower}.id, ${entityLower});
    return ${entityLower};
  }

  update(id: string, input: Update${n.entity}Input): ${n.entity} {
    const current = this.get(id);
    const updated: ${n.entity} = {
      ...current,
      name: input.name ?? current.name,
      updatedAt: new Date().toISOString(),
    };
    this.items.set(id, updated);
    return updated;
  }

  remove(id: string): void {
    this.get(id);
    this.items.delete(id);
  }
}

export const ${n.camel}Service = new ${n.pascal}Service();
`,
    [`${dir}/${n.kebab}.module.ts`]: `import type { RouteGroup } from 'voltts';
import {
  Create${n.entity}Schema,
  ${n.entity}ParamsSchema,
  Update${n.entity}Schema,
  type Create${n.entity}Input,
  type Update${n.entity}Input,
} from './${n.kebab}.schema';
import { ${n.camel}Service } from './${n.kebab}.service';

const tags = ['${n.label}'];

/**
 * ${n.label} routes. Mount with:
 *   app.group('/api/${n.kebab}', ${n.camel}Module);
 */
export function ${n.camel}Module(group: RouteGroup): void {
  group.get('/', () => ${n.camel}Service.list(), {
    tags,
    summary: 'List ${n.label.toLowerCase()}',
  });

  group.get('/:id', (c) => ${n.camel}Service.get(c.params.id), {
    params: ${n.entity}ParamsSchema,
    tags,
    summary: 'Get a ${n.entity} by id',
  });

  group.post('/', (c) => c.json(${n.camel}Service.create(c.body as Create${n.entity}Input), 201), {
    body: Create${n.entity}Schema,
    tags,
    summary: 'Create a ${n.entity}',
  });

  group.patch('/:id', (c) => ${n.camel}Service.update(c.params.id, c.body as Update${n.entity}Input), {
    params: ${n.entity}ParamsSchema,
    body: Update${n.entity}Schema,
    tags,
    summary: 'Update a ${n.entity}',
  });

  group.delete(
    '/:id',
    (c) => {
      ${n.camel}Service.remove(c.params.id);
      return new Response(null, { status: 204 });
    },
    { params: ${n.entity}ParamsSchema, tags, summary: 'Delete a ${n.entity}' }
  );
}
`,
    [`test/${n.kebab}.test.ts`]: `import { describe, expect, it } from 'bun:test';
import { createTestClient, Volt } from 'voltts';
import { ${n.camel}Module } from '../src/modules/${n.kebab}/${n.kebab}.module';

const app = new Volt();
app.group('/api/${n.kebab}', ${n.camel}Module);
const client = createTestClient(app);

describe('${n.kebab} module', () => {
  it('creates, reads, updates and deletes a ${n.entity}', async () => {
    const created = await client.post('/api/${n.kebab}', { body: { name: 'First' } });
    expect(created.status).toBe(201);
    const ${entityLower} = await created.json();
    expect(${entityLower}.name).toBe('First');

    const fetched = await client.get(\`/api/${n.kebab}/\${${entityLower}.id}\`);
    expect(fetched.status).toBe(200);

    const updated = await client.patch(\`/api/${n.kebab}/\${${entityLower}.id}\`, { body: { name: 'Renamed' } });
    expect(updated.status).toBe(200);
    expect((await updated.json()).name).toBe('Renamed');

    const list = await client.get('/api/${n.kebab}');
    expect(await list.json()).toHaveLength(1);

    const removed = await client.delete(\`/api/${n.kebab}/\${${entityLower}.id}\`);
    expect(removed.status).toBe(204);

    const missing = await client.get(\`/api/${n.kebab}/\${${entityLower}.id}\`);
    expect(missing.status).toBe(404);
  });

  it('rejects invalid payloads with 400', async () => {
    const res = await client.post('/api/${n.kebab}', { body: { name: '' } });
    expect(res.status).toBe(400);
  });

  it('rejects malformed ids with 400', async () => {
    const res = await client.get('/api/${n.kebab}/not-a-uuid');
    expect(res.status).toBe(400);
  });
});
`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────────────────────

export function projectFiles(ctx: ProjectContext): FileMap {
  return {
    'package.json': packageJson(ctx),
    'tsconfig.json': tsconfigJson(),
    '.gitignore': gitignore,
    '.env.example': envFile(ctx.template),
    '.env': envFile(ctx.template),
    'README.md': readme(ctx),
    ...(ctx.template === 'api' ? apiFiles(ctx) : minimalFiles(ctx)),
  };
}
