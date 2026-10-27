import { spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import process from 'process';
import { createInterface } from 'node:readline/promises';
import { projectFiles, TEMPLATES, type TemplateName } from './templates';

export function printHelp(): void {
  console.log(`
⚡ Volt CLI — The High-Performance Bun API Framework

Usage:
  volt <command> [options]

Commands:
  dev [file]       Run development server with hot reload (default: src/index.ts)
  routes [file]    List all registered routes and HTTP methods in the app
  new [name]       Create an app and choose a template
                   --template api|minimal (for scripts or CI)
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

export function scaffoldProject(name: string, template: TemplateName = 'api', cwd = process.cwd()): void {
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(name) || name === '.' || name === '..') {
    throw new Error('Project name must use lowercase letters, numbers, dots, hyphens or underscores and cannot contain a path.');
  }
  if (!Object.hasOwn(TEMPLATES, template)) throw new Error(`Unknown template: ${template}`);
  const targetDir = resolve(cwd, name);
  if (existsSync(targetDir)) throw new Error(`Directory '${name}' already exists.`);
  const files = projectFiles({ name, template });
  mkdirSync(targetDir, { recursive: false });
  for (const [path, content] of Object.entries(files)) {
    const destination = resolve(targetDir, path);
    mkdirSync(resolve(destination, '..'), { recursive: true });
    writeFileSync(destination, content, { flag: 'wx' });
  }
  console.log(`\n⚡ Created ${name} using the ${template} template.\n\n  cd ${name}\n  bun install\n  bun run dev\n  bun test\n`);
}

export async function createProject(args: string[]): Promise<void> {
  const positionals: string[] = [];
  let template: string | undefined;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === '--template' || arg === '-t') {
      template = args[++i];
      if (!template || template.startsWith('-')) throw new Error('Provide a template after --template.');
    } else if (arg.startsWith('--template=')) template = arg.slice('--template='.length);
    else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
    else positionals.push(arg);
  }
  if (positionals.length > 1) throw new Error('Provide one project name.');
  if (template !== undefined && !Object.hasOwn(TEMPLATES, template)) throw new Error(`Unknown template: ${template}. Choose api or minimal.`);
  let name = positionals[0];
  if (!process.stdin.isTTY) {
    if (!name) throw new Error('Provide a project name: volt new my-api --template api');
    template ??= 'api';
  }
  if (!name || !template) {
    const prompt = createInterface({ input: process.stdin, output: process.stdout });
    try {
      if (!name) name = (await prompt.question('Project name: ')).trim();
      if (!template) {
        console.log('\nSelect a template:\n  1. api     - Modular REST API with config, validation, OpenAPI and tests\n  2. minimal - Small app with one route and a test');
        const choice = (await prompt.question('Template [1]: ')).trim();
        if (choice === '' || choice === '1' || choice === 'api') template = 'api';
        else if (choice === '2' || choice === 'minimal') template = 'minimal';
        else throw new Error('Choose 1 (api) or 2 (minimal).');
      }
    } finally { prompt.close(); }
  }
  scaffoldProject(name || '', template as TemplateName);
}
