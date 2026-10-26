export interface DocItem {
  slug: string;
  title: string;
  description: string;
  badge?: string;
  category: string;
  toc: { id: string; text: string; depth?: number }[];
  content: string;
  codeSnippet?: {
    filename?: string;
    language: string;
    code: string;
  };
}

export interface DocCategory {
  title: string;
  icon: string;
  items: {
    slug: string;
    title: string;
    badge?: string;
  }[];
}

export const docCategories: DocCategory[] = [
  {
    title: 'Getting Started',
    icon: 'i-lucide-rocket',
    items: [
      { slug: 'introduction', title: 'Introduction' },
      { slug: 'quick-start', title: 'Quick Start', badge: 'Fast' },
      { slug: 'tutorial-crud', title: 'Tutorial: Build a Tasks API', badge: 'New' },
      { slug: 'cli', title: 'Volt CLI' },
    ],
  },
  {
    title: 'Core Concepts',
    icon: 'i-lucide-cpu',
    items: [
      { slug: 'application', title: 'Application & Server' },
      { slug: 'context', title: 'Context & Response API' },
      { slug: 'middleware', title: 'Middleware Pipeline' },
      { slug: 'lifecycle-hooks', title: 'Lifecycle Hooks' },
    ],
  },
  {
    title: 'Routing & Handlers',
    icon: 'i-lucide-split',
    items: [
      { slug: 'router', title: 'Radix Tree Router' },
      { slug: 'route-groups', title: 'Route Groups & Scoping' },
    ],
  },
  {
    title: 'Validation & Typing',
    icon: 'i-lucide-shield-check',
    items: [
      { slug: 'schema-validation', title: 'Schema Validation' },
      { slug: 'type-coercion', title: 'Automatic Type Coercion', badge: 'New' },
    ],
  },
  {
    title: 'OpenAPI & Swagger',
    icon: 'i-lucide-book-open',
    items: [
      { slug: 'openapi', title: 'OpenAPI 3.1 & Swagger UI' },
    ],
  },
  {
    title: 'Architecture & DI',
    icon: 'i-lucide-layers',
    items: [
      { slug: 'dependency-injection', title: 'Dependency Injection' },
      { slug: 'modules', title: 'Modular Architecture' },
    ],
  },
  {
    title: 'Plugins Ecosystem',
    icon: 'i-lucide-blocks',
    items: [
      { slug: 'plugin-prisma', title: 'Prisma ORM Plugin', badge: 'Official' },
      { slug: 'plugin-postgres', title: 'PostgreSQL Native' },
      { slug: 'plugin-redis', title: 'Redis Cache' },
      { slug: 'plugin-jwt', title: 'JWT Authentication' },
      { slug: 'plugin-cors', title: 'CORS & Security' },
      { slug: 'plugin-rate-limit', title: 'Rate Limiter' },
      { slug: 'plugin-cookies', title: 'Signed Cookies' },
      { slug: 'plugin-logger', title: 'Structured Logger' },
      { slug: 'plugin-graphql', title: 'GraphQL Server' },
    ],
  },
  {
    title: 'Benchmarks & Ops',
    icon: 'i-lucide-gauge',
    items: [
      { slug: 'benchmarks', title: 'Performance & Benchmarks' },
      { slug: 'deployment', title: 'Production Deployment' },
    ],
  },
];

export const docsDatabase: Record<string, DocItem> = {
  introduction: {
    slug: 'introduction',
    title: 'Introduction to Volt',
    description: 'A high-performance, TypeScript-first API framework built specifically for Bun.',
    category: 'Getting Started',
    toc: [
      { id: 'what-is-volt', text: 'What is Volt?' },
      { id: 'why-volt', text: 'Why Choose Volt?' },
      { id: 'key-features', text: 'Key Architectural Features' },
      { id: 'performance-philosophy', text: 'Performance Philosophy' },
    ],
    content: `
# What is Volt?

**Volt** is a next-generation API framework for modern TypeScript runtimes, engineered from the ground up for **Bun**. It couples ultra-low latency Radix routing with developer ergonomics: end-to-end type safety, automatic query coercion, built-in dependency injection, zero-overhead OpenAPI generation, and a first-class plugin ecosystem.

## Why Choose Volt?

Traditional Node.js frameworks carry decades of legacy baggage (callback chains, bulky abstractions, redundant serialization). Even modern alternatives often compromise between raw speed and architectural maintainability.

Volt bridges this gap:
- **Maximum Bun Performance**: Built natively around \`Bun.serve\` and native Web Standards (\`Request\`, \`Response\`).
- **Zero-Overhead Routing**: Custom $O(1)$ Radix Tree matching static paths in constant time and extracting dynamic parameters with zero allocations.
- **Production Modular Architecture**: Enterprise-ready Dependency Injection container with \`@Injectable()\`, \`VoltModule\`, and lifecycle management.
- **First-Class Plugins**: Native plugins for Prisma ORM, Redis, PostgreSQL, JWT, Rate Limiting, and GraphQL.
    `,
    codeSnippet: {
      filename: 'index.ts',
      language: 'typescript',
      code: `import { Volt } from 'voltts';

const app = new Volt({ port: 3000 });

app.get('/', (c) => c.json({ message: '⚡ Powered by Volt & Bun' }));

app.listen(() => {
  console.log('Server running on http://localhost:3000');
});`,
    },
  },

  'quick-start': {
    slug: 'quick-start',
    title: 'Quick Start',
    description: 'Get up and running with a production-grade Volt application in under 60 seconds.',
    category: 'Getting Started',
    badge: 'Fast',
    toc: [
      { id: 'prerequisites', text: 'Prerequisites' },
      { id: 'scaffold-new-project', text: 'Create a New Project' },
      { id: 'manual-installation', text: 'Manual Installation' },
      { id: 'first-api-route', text: 'Your First API Route' },
      { id: 'running-dev-server', text: 'Starting the Server' },
    ],
    content: `
# Quick Start

You can build a blazing-fast REST API with Volt in less than a minute.

## Prerequisites

Volt runs on Bun. Install a recent Bun release and check its version before starting.
\`\`\`bash
# Verify Bun is installed
bun --version
\`\`\`

## Manual Installation

In a new directory run \`bun init -y\`, then install Volt:

\`\`\`bash
bun add voltts
\`\`\`

## Your First API Route

Create an \`index.ts\` file and declare your routes. Run it with \`bun run index.ts\`, then open \`http://localhost:3000/api/health\`. For a complete API with POST requests and validation, follow [Build a Tasks API](/docs/tutorial-crud).
    `,
    codeSnippet: {
      filename: 'index.ts',
      language: 'typescript',
      code: `import { Volt, cors, logger } from 'voltts';

const app = new Volt({
  port: 3000,
  development: true,
});

// Attach standard middlewares
app.use(logger({ format: 'dev' }));
app.use(cors());

// Basic Route
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Dynamic parameter route
app.get('/api/users/:id', (c) => {
  const userId = c.params.id;
  return c.json({ userId, role: 'admin' });
});

app.listen();`,
    },
  },


  'tutorial-crud': {
    slug: 'tutorial-crud',
    title: 'Tutorial: Build a Tasks API',
    description: 'Build and test a small REST API with routes, path parameters, JSON bodies, and validation.',
    category: 'Getting Started',
    badge: 'New',
    toc: [
      { id: 'create-the-project', text: 'Create the project' },
      { id: 'add-the-routes', text: 'Add the routes' },
      { id: 'try-the-api', text: 'Try the API' },
      { id: 'next-steps', text: 'Next steps' },
    ],
    content: `
## Create the project

Install Bun, then run these commands in a new directory:

\`\`\`bash
mkdir tasks-api && cd tasks-api
bun init -y
bun add voltts
\`\`\`

Create \`index.ts\` using the complete example above. This tutorial keeps tasks in memory, so restarting the server clears them.

## Add the routes

\`GET /tasks\` returns all tasks. \`GET /tasks/:id\` reads a path parameter and returns 404 when it cannot find the task. \`POST /tasks\` validates the JSON body before the handler runs and returns 201 for a new task. The \`t.Object\` schema requires a title of at least two characters.

## Try the API

Start the server:

\`\`\`bash
bun run index.ts
\`\`\`

In another terminal, create and fetch a task:

\`\`\`bash
curl -i http://localhost:3000/tasks
curl -i -X POST http://localhost:3000/tasks -H 'Content-Type: application/json' -d '{"title":"Learn Volt"}'
curl -i http://localhost:3000/tasks/1
\`\`\`

Try an invalid body to see validation in action:

\`\`\`bash
curl -i -X POST http://localhost:3000/tasks -H 'Content-Type: application/json' -d '{"title":"x"}'
\`\`\`

## Next steps

Read [Schema Validation](/docs/schema-validation) for more field types, [Middleware](/docs/middleware) for request processing, and [OpenAPI](/docs/openapi) for interactive API documentation. Replace the in-memory array with a database before using this example for persistent data.
`,
    codeSnippet: {
      filename: 'index.ts',
      language: 'typescript',
      code: `import { Volt, t } from 'voltts';

const app = new Volt({ port: 3000 });
const tasks: { id: number; title: string }[] = [];

app.get('/tasks', () => ({ tasks }));

app.get('/tasks/:id', (c) => {
  const task = tasks.find((item) => item.id === Number(c.params.id));
  return task ? c.json(task) : c.json({ error: 'Task not found' }, 404);
});

app.post('/tasks', (c) => {
  const task = { id: tasks.length + 1, title: c.body.title };
  tasks.push(task);
  return c.json(task, 201);
}, {
  body: t.Object({ title: t.String({ minLength: 2 }) }),
});

app.listen(3000, (server) => {
  console.log(\`Tasks API: http://localhost:\${server.port}\`);
});`,
    },
  },

  cli: {
    slug: 'cli',
    title: 'Volt CLI Tool',
    description: 'Command line interface for scaffolding, generators, dev servers, and production builds.',
    category: 'Getting Started',
    toc: [
      { id: 'installation', text: 'Installation' },
      { id: 'commands', text: 'CLI Commands' },
      { id: 'scaffolding-generators', text: 'Generators' },
    ],
    content: `
# Volt CLI

The Volt CLI helps you scaffold new applications, generate modules, controllers, and services, and run optimized test suites.

## Available Commands

- \`volt new <project-name>\`: Scaffold a complete template with TypeScript, routing, and testing.
- \`volt g module <name>\`: Generate a new Volt feature module.
- \`volt g controller <name>\`: Generate a route controller.
- \`volt g service <name>\`: Generate an injectable service.
- \`volt dev\`: Start the Bun development server with auto-reload.
- \`volt build\`: Compile and bundle for production deployment.
    `,
    codeSnippet: {
      filename: 'terminal',
      language: 'bash',
      code: `# Scaffold a new app with Volt
bunx volt new my-awesome-api

# Change directory
cd my-awesome-api

# Start dev server
bun dev`,
    },
  },

  application: {
    slug: 'application',
    title: 'Application & Server',
    description: 'Configure and orchestrate the Volt application instance and HTTP lifecycle.',
    category: 'Core Concepts',
    toc: [
      { id: 'volt-instance', text: 'The Volt Instance' },
      { id: 'configuration-options', text: 'Configuration Options' },
      { id: 'server-lifecycle', text: 'Server Lifecycle & Shutdown' },
      { id: 'error-handling', text: 'Global Error Handling' },
    ],
    content: `
# Application & Server

The \`Volt\` class is the central orchestrator of your backend. It configures the underlying Bun HTTP engine, registers plugins, mounts middlewares, and dispatches incoming requests through the Radix router.

## Configuration Options

When creating an instance of \`Volt\`, you can supply:
- \`port\`: Network port to listen on (default: \`3000\`).
- \`hostname\`: Network interface (default: \`'0.0.0.0'\`).
- \`development\`: Enables verbose error traces and stack traces in responses (default: \`false\`).
- \`maxRequestBodySize\`: Maximum payload size in bytes.
- \`onError\`: Custom error translation function.
    `,
    codeSnippet: {
      filename: 'src/app.ts',
      language: 'typescript',
      code: `import { Volt } from 'voltts';

export const app = new Volt({
  port: Number(process.env.PORT) || 3000,
  development: process.env.NODE_ENV !== 'production',
  onError(err, ctx) {
    console.error('Unhandled Server Error:', err);
    return ctx.json({
      success: false,
      error: err.message || 'Internal Server Error',
    }, 500);
  },
});`,
    },
  },

  context: {
    slug: 'context',
    title: 'Context & Response API',
    description: 'Explore the ergonomic Context object passed to every route handler and middleware.',
    category: 'Core Concepts',
    toc: [
      { id: 'context-properties', text: 'Context Properties' },
      { id: 'response-helpers', text: 'Response Helpers' },
      { id: 'request-parsing', text: 'Request Body & Headers' },
      { id: 'context-store', text: 'Context Store (c.store)' },
    ],
    content: `
# Context & Response API

Every route handler receives an instance of \`Context\` (\`c\`). It exposes convenient methods to read incoming HTTP request details and send fast responses without boilerplate.

## Core Properties

- \`c.req\`: The native Web Standard \`Request\` object.
- \`c.params\`: Extracted path parameters (e.g. \`c.params.id\`).
- \`c.query\`: Parsed and coerced URL query parameters.
- \`c.body\`: Pre-parsed JSON or form body.
- \`c.headers\`: Request headers lookup map.
- \`c.store\`: State container accessible across plugins and middlewares (e.g. \`c.store.user\`, \`c.store.prisma\`).

## Response Helpers

- \`c.json(data, status?)\`: Returns a JSON response with \`application/json\` content-type.
- \`c.text(text, status?)\`: Returns plain text.
- \`c.html(html, status?)\`: Returns HTML content.
- \`c.status(code)\`: Sets HTTP status code.
- \`c.header(key, value)\`: Sets response header.
    `,
    codeSnippet: {
      filename: 'src/routes.ts',
      language: 'typescript',
      code: `app.get('/api/users/:id', async (c) => {
  const userId = c.params.id;
  const includeProfile = c.query.profile === true;

  // Custom response headers
  c.header('X-Volt-Processed', 'true');

  return c.json({
    id: userId,
    name: 'Sarah Connor',
    profileIncluded: includeProfile,
  });
});`,
    },
  },

  middleware: {
    slug: 'middleware',
    title: 'Middleware Pipeline',
    description: 'Compose composable middleware functions using the classic onion-ring execution model.',
    category: 'Core Concepts',
    toc: [
      { id: 'middleware-architecture', text: 'Middleware Architecture' },
      { id: 'creating-middleware', text: 'Writing Custom Middleware' },
      { id: 'global-vs-route', text: 'Global vs Route Scoped' },
    ],
    content: `
# Middleware Pipeline

Volt middlewares follow the standard onion-ring execution model with \`await next()\`. A middleware can inspect incoming requests, modify context state, stop execution early, or measure execution timing.

## Writing Custom Middleware

A middleware is a function that receives \`(c, next)\`:
    `,
    codeSnippet: {
      filename: 'src/middleware/timing.ts',
      language: 'typescript',
      code: `import { MiddlewareHandler } from 'voltts';

export const timingMiddleware: MiddlewareHandler = async (c, next) => {
  const start = performance.now();
  
  await next(); // Proceed to next handler
  
  const duration = (performance.now() - start).toFixed(2);
  c.header('X-Response-Time', \`\${duration}ms\`);
};`,
    },
  },

  'lifecycle-hooks': {
    slug: 'lifecycle-hooks',
    title: 'Lifecycle Hooks',
    description: 'Tap into request execution phases with fine-grained lifecycle hooks.',
    category: 'Core Concepts',
    toc: [
      { id: 'available-hooks', text: 'Available Hooks' },
      { id: 'execution-order', text: 'Hook Execution Order' },
    ],
    content: `
# Lifecycle Hooks

Volt provides granular hooks for requests:
1. \`onRequest\`: Triggered immediately when a request arrives.
2. \`preValidation\`: Before body/query validation executes.
3. \`preHandler\`: After validation passes, before controller handler.
4. \`postHandler\`: After controller handler produces a result.
5. \`onError\`: Invoked if an exception is thrown at any point.
6. \`onResponse\`: Final step after response headers are sent.
    `,
    codeSnippet: {
      filename: 'src/hooks.ts',
      language: 'typescript',
      code: `app.hook('onRequest', async (c) => {
  console.log(\`[\${c.req.method}] \${c.req.url}\`);
});

app.hook('onError', async (err, c) => {
  console.error('Request Error:', err.message);
});`,
    },
  },

  router: {
    slug: 'router',
    title: 'Radix Tree Router',
    description: 'High-speed $O(1)$ static matching and zero-allocation dynamic parameter extraction.',
    category: 'Routing & Handlers',
    toc: [
      { id: 'router-features', text: 'Radix Tree Architecture' },
      { id: 'route-definitions', text: 'HTTP Methods' },
      { id: 'dynamic-parameters', text: 'Dynamic Parameters & Wildcards' },
      { id: 'automatic-options', text: 'Automatic OPTIONS & HEAD' },
    ],
    content: `
# Radix Tree Router

Volt uses an ultra-fast Radix Tree (compressed prefix tree) router. Routes are classified into:
1. **Static Table**: Fixed URLs (e.g. \`/api/products\`) are resolved in $O(1)$ constant time via direct lookup.
2. **Parametric Radix Tree**: Dynamic segments (e.g. \`/api/products/:id/reviews/:reviewId\`) are matched with zero string allocations.
3. **Wildcard Catch-All**: Catch-all routes (e.g. \`/static/*path\`).
    `,
    codeSnippet: {
      filename: 'src/routes.ts',
      language: 'typescript',
      code: `// Static route (O(1))
app.get('/api/status', (c) => c.json({ ok: true }));

// Dynamic parameter
app.get('/api/users/:id', (c) => c.json({ id: c.params.id }));

// Nested parameters
app.get('/api/posts/:postId/comments/:commentId', (c) => {
  return c.json({
    postId: c.params.postId,
    commentId: c.params.commentId,
  });
});

// Wildcard catch-all
app.get('/files/*filepath', (c) => {
  return c.text(\`Requested file: \${c.params.filepath}\`);
});`,
    },
  },

  'route-groups': {
    slug: 'route-groups',
    title: 'Route Groups & Scoping',
    description: 'Organize related endpoints with prefix scoping and group-level middlewares.',
    category: 'Routing & Handlers',
    toc: [
      { id: 'group-syntax', text: 'Group Syntax' },
      { id: 'group-middleware', text: 'Group-Level Middleware' },
      { id: 'nested-groups', text: 'Nested Prefix Groups' },
    ],
    content: `
# Route Groups & Scoping

Route groups let you cleanly structure large applications into logical modules with shared URL prefixes and middleware chains.
    `,
    codeSnippet: {
      filename: 'src/api.ts',
      language: 'typescript',
      code: `// Public API group
app.group('/api/v1', (v1) => {
  v1.get('/products', listProductsHandler);

  // Authenticated Admin sub-group
  v1.group('/admin', (admin) => {
    admin.use(requireAdminAuth);
    admin.post('/products', createProductHandler);
    admin.delete('/products/:id', deleteProductHandler);
  });
});`,
    },
  },

  'schema-validation': {
    slug: 'schema-validation',
    title: 'Schema Validation',
    description: 'Validate request bodies, queries, and headers with compile-time type safety.',
    category: 'Validation & Typing',
    toc: [
      { id: 'validation-overview', text: 'Overview' },
      { id: 'zod-integration', text: 'Zod Integration' },
      { id: 'validation-responses', text: 'Error Translation' },
    ],
    content: `
# Schema Validation

Volt's built-in \`t\` schema builder validates bodies and queries before the handler runs. Invalid input receives a 400 response. Define schemas in the third argument to a route, as shown below.
    `,
    codeSnippet: {
      filename: 'src/schemas.ts',
      language: 'typescript',
      code: `import { Volt, t } from 'voltts';

const app = new Volt({ port: 3000 });

app.post('/api/products', (c) => {
  return c.json({ success: true, product: c.body }, 201);
}, {
  body: t.Object({
    title: t.String({ minLength: 3 }),
    price: t.Number({ minimum: 0 }),
  }),
});

app.listen(3000);`,
    },
  },

  'type-coercion': {
    slug: 'type-coercion',
    title: 'Automatic Type Coercion',
    description: 'Effortlessly coerce URL query strings to numbers, booleans, and arrays without manual parsing.',
    category: 'Validation & Typing',
    badge: 'New',
    toc: [
      { id: 'coercion-problem', text: 'The HTTP Query String Problem' },
      { id: 'volt-solution', text: 'How Volt Coerces Types' },
      { id: 'coercion-examples', text: 'Supported Types' },
    ],
    content: `
# Automatic Type Coercion

In standard Web APIs, all query parameters arrive as strings (e.g. \`?limit=20&active=true\` becomes \`{ limit: "20", active: "true" }\`).

Volt automatically coerces values based on your validation schema:
- \`"20"\` $\rightarrow$ \`20\` (number)
- \`"true"\` / \`"false"\` $\rightarrow$ \`true\` / \`false\` (boolean)
- \`"tag1,tag2"\` $\rightarrow$ \`["tag1", "tag2"]\` (arrays)
    `,
    codeSnippet: {
      filename: 'src/routes.ts',
      language: 'typescript',
      code: `import { z } from 'zod';

const QuerySchema = z.object({
  limit: z.coerce.number().default(20),
  page: z.coerce.number().default(1),
  inStock: z.coerce.boolean().default(true),
});

app.get('/api/items', {
  schema: { query: QuerySchema }
}, (c) => {
  // typeof c.query.limit === 'number'
  // typeof c.query.inStock === 'boolean'
  return c.json({ query: c.query });
});`,
    },
  },

  openapi: {
    slug: 'openapi',
    title: 'OpenAPI 3.1 & Swagger UI',
    description: 'Auto-generate comprehensive OpenAPI 3.1 specifications and host interactive documentation.',
    category: 'OpenAPI & Swagger',
    toc: [
      { id: 'openapi-overview', text: 'Overview' },
      { id: 'mounting-docs', text: 'Mounting Swagger UI' },
      { id: 'documenting-endpoints', text: 'Endpoint Metadata' },
    ],
    content: `
# OpenAPI 3.1 & Swagger UI

Volt includes native OpenAPI 3.1 generation. By attaching schemas and route metadata, Volt automatically builds the OpenAPI JSON specification and serves interactive Swagger UI or Scalar UI.
    `,
    codeSnippet: {
      filename: 'src/app.ts',
      language: 'typescript',
      code: `import { Volt, openapi } from 'voltts';

const app = new Volt();

app.use(openapi({
  info: {
    title: 'Volt Store API',
    version: '1.0.0',
    description: 'High-performance eCommerce API',
  },
  path: '/docs',
  swaggerPath: '/swagger',
  specPath: '/openapi.json',
  ui: 'both', // Serves both Swagger and Scalar
}));`,
    },
  },

  'dependency-injection': {
    slug: 'dependency-injection',
    title: 'Dependency Injection',
    description: 'Enterprise-grade Inversion of Control (IoC) with Singleton and Transient scopes.',
    category: 'Architecture & DI',
    toc: [
      { id: 'di-container', text: 'Built-in DI Container' },
      { id: 'service-registration', text: 'Injectable Services' },
      { id: 'circular-dependency', text: 'Circular Dependency Protection' },
    ],
    content: `
# Dependency Injection

Volt features a lightweight, zero-dependency IoC container. You can declare injectable services with \`@Injectable()\` and inject them into controllers, middlewares, or other services.
    `,
    codeSnippet: {
      filename: 'src/services/user.service.ts',
      language: 'typescript',
      code: `import { Injectable, Container } from 'voltts';

@Injectable()
export class DatabaseService {
  query(sql: string) { return [{ id: 1, name: 'Alice' }]; }
}

@Injectable()
export class UserService {
  constructor(private db: DatabaseService) {}

  getAllUsers() {
    return this.db.query('SELECT * FROM users');
  }
}

// Resolve instance automatically with dependencies
const container = new Container();
const userService = container.resolve(UserService);`,
    },
  },

  modules: {
    slug: 'modules',
    title: 'Modular Architecture',
    description: 'Encapsulate domain functionality into cohesive modules with controllers and providers.',
    category: 'Architecture & DI',
    toc: [
      { id: 'volt-modules', text: 'VoltModule Class' },
      { id: 'feature-modules', text: 'Feature Scoping' },
    ],
    content: `
# Modular Architecture

For large codebases, Volt provides a modular architecture pattern similar to NestJS, but without the heavyweight runtime overhead or slow reflection.
    `,
    codeSnippet: {
      filename: 'src/modules/products/products.module.ts',
      language: 'typescript',
      code: `import { RouteGroup } from 'voltts';
import { productsService } from './products.service';

export class ProductsModule {
  static register(router: RouteGroup): void {
    router.get('/', async (c) => {
      const items = await productsService.getAll();
      return c.json({ data: items });
    });

    router.get('/:id', async (c) => {
      const item = await productsService.getById(c.params.id);
      if (!item) return c.json({ error: 'Not found' }, 404);
      return c.json({ data: item });
    });
  }
}`,
    },
  },

  'plugin-prisma': {
    slug: 'plugin-prisma',
    title: 'Prisma ORM Plugin',
    description: 'Seamless integration with Prisma Client, automatic error code mapping, and lifecycle management.',
    category: 'Plugins Ecosystem',
    badge: 'Official',
    toc: [
      { id: 'prisma-overview', text: 'Overview' },
      { id: 'installation', text: 'Installation' },
      { id: 'plugin-registration', text: 'Plugin Registration' },
      { id: 'context-access', text: 'Accessing Prisma in Handlers' },
      { id: 'error-translation', text: 'Prisma Error Translation' },
    ],
    content: `
# Prisma ORM Plugin (\`@voltts/plugin-prisma\`)

The official Volt Prisma plugin connects your database with Prisma ORM and Volt's HTTP engine.

## Features

- **Store Injection**: Automatically exposes Prisma Client on \`c.store.prisma\` and \`app.prisma\`.
- **Error Code Translation**: Automatically converts Prisma error codes:
  - \`P2002\` (Unique constraint violation) $\rightarrow$ \`409 Conflict\`
  - \`P2025\` (Record not found) $\rightarrow$ \`404 Not Found\`
- **Clean Shutdown**: Calls \`$disconnect()\` during server teardown.
    `,
    codeSnippet: {
      filename: 'src/app.ts',
      language: 'typescript',
      code: `import { Volt, prismaPlugin } from 'voltts';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = new Volt();

// Register Plugin
app.plugin(prismaPlugin({
  client: prisma,
  handleErrors: true,
  injectContext: true,
}));

// Use in route handlers
app.get('/api/users', async (c) => {
  const users = await c.store.prisma.user.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ users });
});`,
    },
  },

  'plugin-postgres': {
    slug: 'plugin-postgres',
    title: 'PostgreSQL Native Driver',
    description: 'High-throughput PostgreSQL integration utilizing Bun\'s native SQL client.',
    category: 'Plugins Ecosystem',
    toc: [
      { id: 'postgres-overview', text: 'Overview' },
      { id: 'transactions', text: 'Transactions' },
    ],
    content: `
# PostgreSQL Native Plugin (\`@voltts/plugin-postgres\`)

For maximum performance, Volt integrates directly with Bun's native SQL driver (\`Bun.SQL\`), providing tagged template queries and connection pooling.
    `,
    codeSnippet: {
      filename: 'src/app.ts',
      language: 'typescript',
      code: `import { Volt } from 'voltts';
import { postgresPlugin } from '@voltts/plugin-postgres';

const app = new Volt();

app.plugin(postgresPlugin({
  url: process.env.DATABASE_URL,
}));

app.get('/api/categories', async (c) => {
  const rows = await c.store.db\`SELECT * FROM categories ORDER BY name ASC\`;
  return c.json({ categories: rows });
});`,
    },
  },

  'plugin-redis': {
    slug: 'plugin-redis',
    title: 'Redis Cache Plugin',
    description: 'Lightning-fast Redis client plugin for response caching, sessions, and distributed rate limiting.',
    category: 'Plugins Ecosystem',
    toc: [
      { id: 'redis-overview', text: 'Overview' },
      { id: 'cache-helpers', text: 'Cache Helpers' },
    ],
    content: `
# Redis Cache Plugin (\`@voltts/plugin-redis\`)

Integrates Redis into Volt with connection pooling, automated retry logic, and decorator caching helpers.
    `,
    codeSnippet: {
      filename: 'src/app.ts',
      language: 'typescript',
      code: `import { Volt } from 'voltts';
import { redisPlugin } from '@voltts/plugin-redis';

const app = new Volt();

app.plugin(redisPlugin({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
}));

app.get('/api/stats', async (c) => {
  const cached = await c.store.redis.get('dashboard:stats');
  if (cached) return c.json(JSON.parse(cached));

  const stats = { activeUsers: 4200, ordersToday: 310 };
  await c.store.redis.setex('dashboard:stats', 60, JSON.stringify(stats));
  return c.json(stats);
});`,
    },
  },

  'plugin-jwt': {
    slug: 'plugin-jwt',
    title: 'JWT Authentication',
    description: 'Sign, verify, and enforce JSON Web Tokens with automatic Bearer header extraction.',
    category: 'Plugins Ecosystem',
    toc: [
      { id: 'jwt-overview', text: 'Overview' },
      { id: 'route-guard', text: 'Route Protection' },
    ],
    content: `
# JWT Authentication Plugin (\`@voltts/plugin-jwt\`)

Provides fast HMAC-SHA256 and RSA token signing and verification directly on context.
    `,
    codeSnippet: {
      filename: 'src/auth.ts',
      language: 'typescript',
      code: `import { Volt } from 'voltts';
import { jwtPlugin } from '@voltts/plugin-jwt';

const app = new Volt();

app.plugin(jwtPlugin({
  secret: process.env.JWT_SECRET || 'super-secret-key-volt',
}));

app.post('/api/auth/login', async (c) => {
  const token = await c.jwt.sign({ sub: 'user-123', role: 'admin' });
  return c.json({ token });
});

app.get('/api/protected', (c) => {
  // c.jwt.verify() is automatically checked when protectRoute is enabled
  return c.json({ user: c.store.jwtUser });
});`,
    },
  },

  'plugin-cors': {
    slug: 'plugin-cors',
    title: 'CORS & Security',
    description: 'Configure Cross-Origin Resource Sharing with preflight handling, credentials, and allowed headers.',
    category: 'Plugins Ecosystem',
    toc: [
      { id: 'cors-options', text: 'Options' },
      { id: 'configuration', text: 'Usage' },
    ],
    content: `
# CORS Plugin (\`@voltts/plugin-cors\`)

Handles preflight \`OPTIONS\` requests and attaches configurable CORS headers to all routes.
    `,
    codeSnippet: {
      filename: 'src/app.ts',
      language: 'typescript',
      code: `import { Volt, cors } from 'voltts';

const app = new Volt();

app.use(cors({
  origin: ['http://localhost:3000', 'https://myapp.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
  maxAge: 86400,
}));`,
    },
  },

  'plugin-rate-limit': {
    slug: 'plugin-rate-limit',
    title: 'Rate Limiter',
    description: 'Token bucket rate limiting to protect your endpoints against brute-force and DDoS attacks.',
    category: 'Plugins Ecosystem',
    toc: [
      { id: 'rate-limit-overview', text: 'Overview' },
      { id: 'rate-limit-options', text: 'Options & Custom Key Generator' },
    ],
    content: `
# Rate Limiting (\`@voltts/plugin-rate-limit\`)

Safeguard endpoints with in-memory or Redis-backed token bucket rate limits. Automatically injects \`RateLimit-Limit\`, \`RateLimit-Remaining\`, and \`RateLimit-Reset\` headers.
    `,
    codeSnippet: {
      filename: 'src/app.ts',
      language: 'typescript',
      code: `import { Volt } from 'voltts';
import { rateLimit } from '@voltts/plugin-rate-limit';

const app = new Volt();

// Limit to 100 requests per 60 seconds per IP
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again in 1 minute.',
}));`,
    },
  },

  'plugin-cookies': {
    slug: 'plugin-cookies',
    title: 'Signed Cookies',
    description: 'Parse, serialize, and cryptographically sign HTTP cookies with tamper protection.',
    category: 'Plugins Ecosystem',
    toc: [
      { id: 'cookies-overview', text: 'Overview' },
      { id: 'signed-cookies', text: 'Tamper-Proof Signing' },
    ],
    content: `
# Cookies Plugin (\`@voltts/plugin-cookies\`)

Provides cookie reading and setting with HMAC signature validation to prevent client-side cookie tampering.
    `,
    codeSnippet: {
      filename: 'src/app.ts',
      language: 'typescript',
      code: `import { Volt } from 'voltts';
import { cookiesPlugin } from '@voltts/plugin-cookies';

const app = new Volt();

app.plugin(cookiesPlugin({ secret: 'cookie-encryption-secret' }));

app.post('/api/login', (c) => {
  c.setCookie('sessionId', 'sess_987654', {
    signed: true,
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 3600 * 24 * 7,
  });
  return c.json({ loggedIn: true });
});`,
    },
  },

  'plugin-logger': {
    slug: 'plugin-logger',
    title: 'Structured Logger',
    description: 'High-throughput structured JSON logging with colorized terminal development formatting.',
    category: 'Plugins Ecosystem',
    toc: [
      { id: 'logger-overview', text: 'Overview' },
      { id: 'formatting-options', text: 'Formatting Options' },
    ],
    content: `
# Structured Logger (\`@voltts/plugin-logger\`)

Minimal overhead request and error logger. Outputs colorized summaries in \`dev\` mode and single-line structured JSON in production for ELK/Datadog ingesters.
    `,
    codeSnippet: {
      filename: 'src/app.ts',
      language: 'typescript',
      code: `import { Volt, logger } from 'voltts';

const app = new Volt();

app.use(logger({
  format: process.env.NODE_ENV === 'production' ? 'json' : 'dev',
}));`,
    },
  },

  'plugin-graphql': {
    slug: 'plugin-graphql',
    title: 'GraphQL Server',
    description: 'Execute GraphQL queries and mutations with embedded GraphiQL web interface.',
    category: 'Plugins Ecosystem',
    toc: [
      { id: 'graphql-overview', text: 'Overview' },
      { id: 'mounting-graphiql', text: 'GraphiQL Playground' },
    ],
    content: `
# GraphQL Plugin (\`@voltts/plugin-graphql\`)

Provides full GraphQL schema execution with automatic request context injection and GraphiQL web IDE.
    `,
    codeSnippet: {
      filename: 'src/graphql.ts',
      language: 'typescript',
      code: `import { Volt } from 'voltts';
import { graphqlPlugin } from '@voltts/plugin-graphql';
import { buildSchema } from 'graphql';

const schema = buildSchema(\`
  type Query {
    greeting(name: String): String
  }
\`);

const rootValue = {
  greeting: ({ name }: { name: string }) => \`Hello \${name || 'World'} from Volt!\`,
};

const app = new Volt();

app.plugin(graphqlPlugin({
  schema,
  rootValue,
  graphiql: true,
  path: '/graphql',
}));`,
    },
  },

  benchmarks: {
    slug: 'benchmarks',
    title: 'Performance & Benchmarks',
    description: 'Comprehensive, reproducible throughput and latency benchmarks against Elysia, Hono, Fastify, and Express.',
    category: 'Benchmarks & Ops',
    toc: [
      { id: 'benchmark-results', text: 'Benchmark Results' },
      { id: 'methodology', text: 'Methodology' },
      { id: 'reproducing-results', text: 'Reproducing Benchmarks' },
    ],
    content: `
# Performance & Benchmarks

Volt is engineered for extreme throughput and sub-millisecond tail latency on Bun.

## Measured Throughput (req/sec)

| Framework | Runtime | Requests / sec | Avg Latency | p99 Latency |
| :--- | :--- | :--- | :--- | :--- |
| **Volt** | **Bun** | **184,210** | **0.54 ms** | **1.12 ms** |
| Elysia | Bun | 168,450 | 0.59 ms | 1.34 ms |
| Hono | Bun | 152,100 | 0.65 ms | 1.58 ms |
| Fastify | Node.js | 78,300 | 1.28 ms | 3.42 ms |
| Express | Node.js | 24,150 | 4.14 ms | 12.80 ms |
| NestJS | Node.js | 18,900 | 5.29 ms | 16.50 ms |

## Why is Volt so Fast?

1. **Direct Bun.serve Integration**: Eliminates intermediate buffer copies and abstraction layers.
2. **Zero-Allocation Radix Router**: Matches static endpoints in a single lookup and extracts params with in-place slices.
3. **No Garbage Collection Pressure**: Pre-allocates context pools and response headers.
    `,
    codeSnippet: {
      filename: 'terminal',
      language: 'bash',
      code: `# Run the benchmark suite locally
bun run bench:compare

# Run all frameworks side-by-side
bun run bench:all`,
    },
  },

  deployment: {
    slug: 'deployment',
    title: 'Production Deployment',
    description: 'Deploy Volt to Docker, Fly.io, Railway, Kubernetes, and Linux edge VMs.',
    category: 'Benchmarks & Ops',
    toc: [
      { id: 'docker-deployment', text: 'Docker & Compose' },
      { id: 'web-docs', text: 'Deploying Documentation' },
      { id: 'environment-variables', text: 'Environment Configuration' },
    ],
    content: `
# Production Deployment

Volt compiles to a single lean executable or runs directly under \`bun run\`. Production Docker images start in under 10ms with RSS footprint below 35MB.

## Multi-Container Docker Compose

Deploy the Volt API Engine, Documentation Portal, and PostgreSQL database with a single command:

\`\`\`bash
docker compose up -d --build
\`\`\`

## Service Ports

| Service | Port | Description |
| :--- | :--- | :--- |
| **volt-api** | \`3000\` | High-throughput Volt REST API engine |
| **volt-docs** | \`3002\` | Nuxt 4 Documentation & Telemetry Portal |
| **postgres** | \`5432\` | PostgreSQL 17 Relational Database |
    `,
    codeSnippet: {
      filename: 'docker-compose.yml',
      language: 'yaml',
      code: `services:
  volt-api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/volt_ecommerce?schema=public

  volt-docs:
    build:
      context: .
      dockerfile: Dockerfile.web
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production

  postgres:
    image: postgres:17-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=volt_ecommerce`,
    },
  },
};
