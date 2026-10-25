import { spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import process from 'process';

export function printHelp(): void {
  console.log(`
⚡ Volt CLI — The High-Performance Bun API Framework

Usage:
  volt <command> [options]

Commands:
  dev [file]       Run development server with hot reload (default: src/index.ts)
  routes [file]    List all registered routes and HTTP methods in the app
  new <name>       Scaffold a new production-ready Volt API project
  version, -v      Show current Volt version
  help, -h         Show this help message

Options:
  --port, -p       Port number for dev server (default: 3000)
  --host           Host to bind (default: 0.0.0.0)
`);
}

export function devServer(entry = 'src/index.ts'): void {
  const file = existsSync(entry) ? entry : existsSync('index.ts') ? 'index.ts' : entry;
  console.log(`⚡ Starting Volt development server with Bun: ${file}`);

  const proc = spawn('bun', ['--watch', file], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' },
  });

  proc.on('close', (code) => {
    process.exit(code ?? 0);
  });
}

export async function inspectRoutes(entry = 'src/index.ts'): Promise<void> {
  const fullPath = resolve(process.cwd(), entry);
  if (!existsSync(fullPath)) {
    console.error(`Error: Entry file not found at ${fullPath}`);
    process.exit(1);
  }

  try {
    const mod = await import(fullPath);
    const app = mod.default || mod.app;

    if (!app || typeof app.getRegisteredRoutes !== 'function') {
      console.error('Error: Entry file must export default Volt instance or named "app"');
      process.exit(1);
    }

    const routes = app.getRegisteredRoutes();
    console.log('\n⚡ Registered Volt Routes:\n');
    console.log('METHOD   PATH                     TAGS');
    console.log('--------------------------------------------');
    for (const r of routes) {
      const method = r.method.padEnd(8, ' ');
      const path = r.path.padEnd(24, ' ');
      const tags = (r.schema?.tags || ['default']).join(', ');
      console.log(`${method} ${path} ${tags}`);
    }
    console.log(`\nTotal Routes: ${routes.length}\n`);
  } catch (err: any) {
    console.error(`Failed to inspect routes: ${err.message}`);
    process.exit(1);
  }
}

export function scaffoldProject(name: string): void {
  if (!name) {
    console.error('Error: Project name required: volt new <name>');
    process.exit(1);
  }

  const targetDir = resolve(process.cwd(), name);
  if (existsSync(targetDir)) {
    console.error(`Error: Directory '${name}' already exists.`);
    process.exit(1);
  }

  mkdirSync(resolve(targetDir, 'src'), { recursive: true });

  // package.json
  const pkg = {
    name,
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'volt dev',
      start: 'bun run src/index.ts',
      test: 'bun test',
    },
    dependencies: {
      volt: 'latest',
    },
  };
  writeFileSync(resolve(targetDir, 'package.json'), JSON.stringify(pkg, null, 2));

  // tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: 'ESNext',
      module: 'ESNext',
      moduleResolution: 'bundler',
      strict: true,
      skipLibCheck: true,
      types: ['bun-types'],
    },
  };
  writeFileSync(resolve(targetDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

  // src/index.ts
  const indexTs = `import { Volt, t, cors, logger } from 'volt';

const app = new Volt({ port: 3000 });

app.use(cors());
app.use(logger());

app.get('/', () => {
  return { message: '⚡ Welcome to Volt API on Bun!' };
});

app.get('/users/:id', (c) => {
  return { id: c.params.id, name: 'Alice' };
}, {
  params: t.Object({ id: t.String() }),
});

app.post('/users', async (c) => {
  const body = await c.parseBody();
  return c.json({ user: body, created: true }, 201);
}, {
  body: t.Object({
    name: t.String({ minLength: 2 }),
    email: t.String({ format: 'email' }),
  }),
});

app.listen(3000, (server) => {
  console.log(\`⚡ Server running on http://localhost:\${server.port}\`);
});

export default app;
`;
  writeFileSync(resolve(targetDir, 'src/index.ts'), indexTs);

  console.log(`
⚡ Successfully created project "${name}"!

Get started:
  cd ${name}
  bun install
  bun run dev
`);
}
