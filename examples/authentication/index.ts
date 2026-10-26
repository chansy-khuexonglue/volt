import { cors, jwt, logger, openapi, sign, t, verify, Volt } from 'voltts';

const PORT = Number(process.env.PORT) || 3004;
const JWT_SECRET = process.env.JWT_SECRET || 'volt-auth-demo-secret-key-32-chars-long!';

const app = new Volt({
  port: PORT,
  development: true,
});

app.use(logger());
app.use(cors());

app.use(
  openapi({
    info: {
      title: 'Authentication & Authorization API',
      version: '1.0.0',
      description: 'JWT Authentication Flow with Role-Based Access Control',
    },
    path: '/docs',
  })
);

interface Account {
  id: string;
  email: string;
  passwordHash: string; // In production, hash with Bun.password.hash
  role: 'admin' | 'user';
}

const accounts: Account[] = [
  { id: 'usr_1', email: 'admin@volt.sh', passwordHash: 'secret123', role: 'admin' },
  { id: 'usr_2', email: 'user@volt.sh', passwordHash: 'secret123', role: 'user' },
];

// Register endpoint
app.post(
  '/auth/register',
  async (c) => {
    const { email, password, role } = c.body;

    if (accounts.some((a) => a.email === email)) {
      return c.json({ error: 'Email already registered' }, 409);
    }

    const newAccount: Account = {
      id: `usr_${accounts.length + 1}`,
      email,
      passwordHash: password,
      role: role || 'user',
    };
    accounts.push(newAccount);

    const token = await sign(
      { sub: newAccount.id, email: newAccount.email, role: newAccount.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return c.json({ message: 'Account registered', token }, 201);
  },
  {
    summary: 'Register account',
    tags: ['Auth'],
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 6 }),
      role: t.Optional(t.Enum(['admin', 'user'] as const)),
    }),
  }
);

// Login endpoint
app.post(
  '/auth/login',
  async (c) => {
    const { email, password } = c.body;
    const account = accounts.find((a) => a.email === email && a.passwordHash === password);

    if (!account) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const token = await sign(
      { sub: account.id, email: account.email, role: account.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return { token, type: 'Bearer' };
  },
  {
    summary: 'Login with credentials',
    tags: ['Auth'],
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String(),
    }),
  }
);

// Protected: Current user profile
app.get(
  '/auth/me',
  (c) => ({
    authenticated: true,
    user: c.store.user,
  }),
  {
    summary: 'Get current user profile (JWT protected)',
    tags: ['User'],
  },
  [jwt({ secret: JWT_SECRET })]
);

// Role-based authorization middleware
function requireRole(requiredRole: 'admin' | 'user') {
  return (c: any, next: any) => {
    const user = c.store.user;
    if (!user || user.role !== requiredRole) {
      return c.json({ error: 'Forbidden: Insufficient privileges' }, 403);
    }
    return next();
  };
}

// Protected: Admin-only dashboard
app.get(
  '/admin/dashboard',
  () => ({
    adminAccessGranted: true,
    totalAccounts: accounts.length,
    users: accounts.map((a) => ({ id: a.id, email: a.email, role: a.role })),
  }),
  {
    summary: 'Admin-only route',
    tags: ['Admin'],
  },
  [jwt({ secret: JWT_SECRET }), requireRole('admin')]
);

app.listen(PORT, (server) => {
  console.log(`⚡ Authentication server running at http://localhost:${server.port}`);
  console.log(`📖 Docs at http://localhost:${server.port}/docs`);
});

export default app;
