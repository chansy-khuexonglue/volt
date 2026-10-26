import {
  cache,
  cors,
  JobQueue,
  jwt,
  logger,
  openapi,
  rateLimit,
  secureHeaders,
  sign,
  t,
  Volt,
} from 'voltts';

const PORT = Number(process.env.PORT) || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'volt-demo-secret-key-32-chars-long!';

const app = new Volt({
  port: PORT,
  development: true,
  maxRequestBodySize: 10 * 1024 * 1024, // 10MB
});

// Background Job Queue
const jobs = new JobQueue({ concurrency: 2 });
jobs.define<{ title: string }, { done: boolean }>('processData', async (job) => {
  console.log(`[JobQueue] Processing task: ${job.data.title}`);
  await new Promise((r) => setTimeout(r, 100));
  return { done: true };
});

// Middleware suite
app.use(logger());
app.use(cors());
app.use(
  secureHeaders({
    contentSecurityPolicy:
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net data: blob:;",
  })
);
app.use(rateLimit({ max: 500, windowMs: 60_000 }));

// OpenAPI & Swagger Documentation Plugins
app.use(
  openapi({
    info: {
      title: '⚡ Volt Starter API',
      version: '1.0.0',
      description: 'High-performance TypeScript-first API framework built on Bun',
    },
    path: '/docs',
    swaggerPath: '/swagger',
    specPath: '/openapi.json',
    ui: 'both',
  })
);

// In-memory data store
const users = [
  { id: '1', name: 'Alice', email: 'alice@volt.sh', role: 'admin' },
  { id: '2', name: 'Bob', email: 'bob@volt.sh', role: 'developer' },
];

// Routes
app.get('/', () => ({
  framework: '⚡ Volt',
  version: '0.1.0',
  swagger: `http://localhost:${PORT}/swagger`,
  scalarDocs: `http://localhost:${PORT}/docs`,
  openApiSpec: `http://localhost:${PORT}/openapi.json`,
  features: ['P0 Core', 'P1 JWT Auth & File Uploads', 'P2 Cache & Background Jobs'],
  endpoints: [
    'GET /users',
    'POST /users',
    'POST /auth/login',
    'GET /auth/me',
    'GET /cached-stats',
    'POST /upload',
    'POST /tasks',
  ],
}));

// Users CRUD
app.get(
  '/users',
  () => users,
  {
    summary: 'List all users',
    tags: ['Users'],
  }
);

app.get(
  '/users/:id',
  (c) => {
    const user = users.find((u) => u.id === c.params.id);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    return user;
  },
  {
    summary: 'Get user by ID',
    tags: ['Users'],
    params: t.Object({
      id: t.String(),
    }),
  }
);

app.post(
  '/users',
  async (c) => {
    const newUser = {
      id: String(users.length + 1),
      name: c.body.name,
      email: c.body.email,
      role: c.body.role || 'user',
    };
    users.push(newUser);
    return c.json(newUser, 201);
  },
  {
    summary: 'Create a new user',
    tags: ['Users'],
    body: t.Object({
      name: t.String({ minLength: 2, maxLength: 50 }),
      email: t.String({ format: 'email' }),
      role: t.Optional(t.Enum(['admin', 'developer', 'user'] as const)),
    }),
  }
);

// P1 Feature: JWT Authentication
app.post(
  '/auth/login',
  async (c) => {
    const { email } = c.body;
    const user = users.find((u) => u.email === email);
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = await sign(
      { sub: user.id, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return { token, type: 'Bearer' };
  },
  {
    summary: 'Generate JWT token',
    tags: ['Auth'],
    body: t.Object({
      email: t.String({ format: 'email' }),
    }),
  }
);

app.get(
  '/auth/me',
  (c) => {
    return {
      authenticated: true,
      user: c.store.user,
    };
  },
  {
    summary: 'Protected route with JWT',
    tags: ['Auth'],
  },
  [jwt({ secret: JWT_SECRET })]
);

// P1 Feature: File Uploads
app.post(
  '/upload',
  async (c) => {
    const file = await c.file('avatar');
    if (!file) {
      return c.json({ error: 'No avatar file provided in multipart form' }, 400);
    }

    return {
      received: true,
      filename: file.name,
      sizeBytes: file.size,
      mimeType: file.type,
    };
  },
  {
    summary: 'Upload avatar via multipart form-data',
    tags: ['Uploads'],
  }
);

// P2 Feature: High-Speed Cache Middleware
app.get(
  '/cached-stats',
  () => ({
    timestamp: Date.now(),
    server: 'Volt Bun Native',
    userCount: users.length,
  }),
  {
    summary: 'Cached statistics endpoint with ETag',
    tags: ['Performance'],
  },
  [cache({ ttl: 15, clientCacheControl: 'public, max-age=15' })]
);

// P2 Feature: Background Tasks
app.post(
  '/tasks',
  async (c) => {
    const job = jobs.add('processData', { title: c.body.title || 'Untitled task' });
    return c.json({ taskId: job.id, status: job.status }, 202);
  },
  {
    summary: 'Enqueue background job',
    tags: ['Jobs'],
    body: t.Object({
      title: t.String(),
    }),
  }
);

app.listen(PORT, (server) => {
  console.log(`⚡ Volt server running on http://localhost:${server.port}`);
  console.log(`📖 Swagger UI docs at http://localhost:${server.port}/swagger`);
  console.log(`📚 Scalar reference docs at http://localhost:${server.port}/docs`);
});

export default app;
