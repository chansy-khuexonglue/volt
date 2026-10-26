import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import ts from 'typescript';
import { createTestClient, type Volt } from '../../packages/volt/src/index';
import { docsDatabase, docCategories, docExamples } from '../app/composables/useDocsData';
import { parseDocBlocks, parseInline } from '../app/utils/docsMarkdown';

let temporary: string;
const apps = new Map<string, Volt>();
const previousSecrets = { JWT_SECRET: process.env.JWT_SECRET, DEMO_PASSWORD: process.env.DEMO_PASSWORD, COOKIE_SECRET: process.env.COOKIE_SECRET };

beforeAll(async () => {
  temporary = await mkdtemp(join(tmpdir(), 'volt-docs-'));
  process.env.JWT_SECRET = 'test-only-docs-secret-long-value';
  process.env.DEMO_PASSWORD = 'docs-demo-password';
  process.env.COOKIE_SECRET = 'test-only-cookie-secret';
  for (const [name, code] of Object.entries(docExamples)) {
    const source = code.replace(/from 'voltts'/g, `from '${resolve(import.meta.dir, '../../packages/volt/src/index.ts')}'`)
      .replace(/from '@voltts\/core'/g, `from '${resolve(import.meta.dir, '../../packages/core/src/index.ts')}'`)
      .replace(/from '@voltts\/node'/g, `from '${resolve(import.meta.dir, '../../packages/node/src/index.ts')}'`);
    const path = join(temporary, `${name}.ts`);
    await writeFile(path, source);
    const loaded = await import(path);
    apps.set(name, loaded.default);
  }
});

afterAll(async () => {
  for (const app of apps.values()) await app.stop();
  await rm(temporary, { recursive: true, force: true });
  for (const [key, value] of Object.entries(previousSecrets)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function client(name: string) { return createTestClient(apps.get(name)!); }

describe('documentation contracts', () => {
  test('all runnable examples pass strict TypeScript checks', () => {
    const root = resolve(import.meta.dir, '../..');
    const config = ts.readConfigFile(join(root, 'tsconfig.json'), ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
    const program = ts.createProgram(Object.keys(docExamples).map((name) => join(temporary, `${name}.ts`)), {
      ...parsed.options,
      noEmit: true,
      allowImportingTsExtensions: true,
      typeRoots: [join(root, 'node_modules/@types')],
      types: ['bun', 'node'],
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    if (diagnostics.length) throw new Error(ts.formatDiagnostics(diagnostics, {
      getCurrentDirectory: () => root,
      getCanonicalFileName: (path) => path,
      getNewLine: () => '\n',
    }));
  });

  test('all internal links and navigation resolve; removed deployment docs stay removed', () => {
    const navigation = docCategories.flatMap((category) => category.items.map((item) => item.slug));
    expect(new Set(navigation).size).toBe(Object.keys(docsDatabase).length);
    for (const page of Object.values(docsDatabase)) {
      for (const match of page.content.matchAll(/\]\(\/docs\/([^\s)#]+)/g)) expect(docsDatabase[match[1]!]).toBeDefined();
      expect(page.toc.length).toBeGreaterThan(0);
    }
    expect(docsDatabase.deployment).toBeUndefined();
  });

  test('displayed examples match the executable samples and all code parses', () => {
    const transpiler = new Bun.Transpiler({ loader: 'ts' });
    const displayed = Object.values(docsDatabase).flatMap((doc) => parseDocBlocks(doc.content))
      .filter((block) => block.kind === 'code');
    for (const code of Object.values(docExamples)) expect(displayed.some((block) => block.code === code.trimEnd())).toBe(true);
    for (const block of displayed) {
      if (block.language === 'typescript') expect(() => transpiler.transformSync(block.code)).not.toThrow();
    }
  });

  test('Markdown preserves blank lines in code, links, tables, and duplicate heading anchors', () => {
    const blocks = parseDocBlocks('## Try it\n\n```ts app.ts\nconst one = 1;\n\nconst two = 2;\n```\n\n| Name | Guide |\n| --- | --- |\n| API | [Start](/docs/quick-start) |\n\n## Try it');
    expect(blocks[1]).toEqual({ kind: 'code', language: 'ts', filename: 'app.ts', code: 'const one = 1;\n\nconst two = 2;' });
    expect(blocks[2]).toEqual({ kind: 'table', headers: ['Name', 'Guide'], rows: [['API', '[Start](/docs/quick-start)']] });
    expect(blocks[3]).toMatchObject({ id: 'try-it-2' });
    expect(parseInline('[unsafe](javascript:alert)')[0]!.kind).toBe('text');
    expect(parseInline('[safe](/docs/testing)')[0]).toMatchObject({ kind: 'link', href: '/docs/testing' });
  });
});

describe('runnable website examples', () => {
  test('hello, context headers, and explicit response status', async () => {
    expect(await (await client('hello').get('/hello')).json()).toEqual({ message: 'Hello Volt' });
    const response = await client('context').get('/users/42', { query: { profile: 'true' } });
    expect(response.headers.get('x-example')).toBe('volt');
    expect((await response.json()).profile).toBe(true);
    expect((await client('context').post('/echo', { body: { title: 'Coffee' } })).status).toBe(201);
  });

  test('CRUD, invalid input, and deleting without reusing IDs', async () => {
    const c = client('tasks');
    expect((await c.post('/tasks', { body: { title: 'x', done: false } })).status).toBe(400);
    const first = await (await c.post('/tasks', { body: { title: 'First task', done: false } })).json();
    const second = await (await c.post('/tasks', { body: { title: 'Second task', done: false } })).json();
    expect((await c.put(`/tasks/${second.id}`, { body: { title: 'Updated', done: true } })).status).toBe(200);
    expect((await c.delete(`/tasks/${first.id}`)).status).toBe(204);
    const third = await (await c.post('/tasks', { body: { title: 'Third task', done: false } })).json();
    expect(third.id).toBeGreaterThan(second.id);
    expect((await c.get(`/tasks/${first.id}`)).status).toBe(404);
    expect((await (await c.get('/tasks')).json()).tasks).toHaveLength(2);
  });

  test('validation checks numeric min and query coercion', async () => {
    const c = client('validation');
    expect((await c.post('/products', { body: { title: 'Coffee', price: 12, stock: 3 } })).status).toBe(201);
    expect((await c.post('/products', { body: { title: 'Coffee', price: -1, stock: 3 } })).status).toBe(400);
    const query = await (await client('coercion').get('/items?limit=20&active=false&tags=coffee&tags=tea')).json();
    expect(query.query).toEqual({ limit: 20, active: false, tags: ['coffee', 'tea'] });
    expect((await client('coercion').get('/items?limit=invalid')).status).toBe(400);
  });

  test('middleware returns one response and guards protected routes', async () => {
    expect((await client('middleware').get('/private')).status).toBe(401);
    const response = await client('middleware').get('/private', { headers: { 'x-demo-key': 'tutorial-key' } });
    expect(response.status).toBe(200);
    expect(response.headers.has('server-timing')).toBe(true);
    expect((await client('groups').post('/api/v1/admin/products', { body: { title: 'Coffee' } })).status).toBe(401);
  });

  test('OpenAPI specifies version, request schema, and 201 response', async () => {
    const spec = await (await client('openapi').get('/openapi.json')).json();
    expect(spec.openapi).toBe('3.1.0');
    expect(spec.paths['/tasks'].post.requestBody).toBeDefined();
    expect(spec.paths['/tasks'].post.responses['201']).toBeDefined();
    expect((await client('openapi').get('/docs')).headers.get('content-type')).toContain('text/html');
  });

  test('JWT verification handles valid, absent, and invalid credentials', async () => {
    const c = client('authentication');
    expect((await c.get('/me')).status).toBe(401);
    expect((await c.post('/token', { body: { password: 'wrong' } })).status).toBe(401);
    const { token } = await (await c.post('/token', { body: { password: 'docs-demo-password' } })).json();
    expect(await (await c.get('/me', { headers: { authorization: `Bearer ${token}` } })).json()).toEqual({ id: 'demo-user' });
    expect((await c.get('/me', { headers: { authorization: 'Bearer invalid' } })).status).toBe(401);
  });

  test('signed cookies round trip and reject a changed signature', async () => {
    const c = client('cookies');
    const response = await c.post('/preference');
    const cookie = response.headers.get('set-cookie')!.split(';')[0]!;
    expect(await (await c.get('/preference', { headers: { cookie } })).json()).toEqual({ theme: 'dark' });
    expect((await c.get('/preference', { headers: { cookie: `${cookie}changed` } })).status).toBe(400);
  });

  test('rate limit example returns 429 on the fourth request', async () => {
    const c = client('rate-limit');
    for (let n = 0; n < 3; n++) expect((await c.get('/limited')).status).toBe(200);
    expect((await c.get('/limited')).status).toBe(429);
  });

  test('public cache returns MISS then HIT with the same payload', async () => {
    const c = client('cache');
    const first = await c.get('/catalog');
    const second = await c.get('/catalog');
    expect(first.headers.get('x-cache')).toBe('MISS');
    expect(second.headers.get('x-cache')).toBe('HIT');
    expect(await first.json()).toEqual(await second.json());
  });

  test('uploads, SSE and downloads return the documented payloads', async () => {
    const form = new FormData();
    form.append('document', new Blob(['Hello Volt'], { type: 'text/plain' }), 'sample.txt');
    const upload = await client('uploads').post('/upload', { body: form });
    expect(upload.status).toBe(201);
    expect((await upload.json()).name).toBe('sample.txt');
    expect(await (await client('streaming').get('/events')).text()).toContain('event: greeting\ndata:');
    expect((await client('streaming').get('/download')).headers.get('content-disposition')).toContain('products.csv');
  });

  test('the documented WebSocket wiring upgrades and echoes a real connection', async () => {
    // Use an ephemeral port so this check does not conflict with local apps.
    const source = docExamples.websocket!.replace('port: 3000,', 'port: 0,')
      .replace('  Bun.serve<{ path: string }>({', '  const server = Bun.serve<{ path: string }>({')
      .replace('\n  });\n}', '\n  });\n  console.log(server.port);\n}');
    const path = join(temporary, 'websocket-server.ts');
    await writeFile(path, source.replace(/from 'voltts'/g, `from '${resolve(import.meta.dir, '../../packages/volt/src/index.ts')}'`));
    const child = Bun.spawn([process.execPath, path], { stdout: 'pipe', stderr: 'pipe' });
    let socket: WebSocket | undefined;
    try {
      const reader = child.stdout.getReader();
      const output = await reader.read();
      reader.releaseLock();
      const port = Number(new TextDecoder().decode(output.value).trim());
      expect(port).toBeGreaterThan(0);
      const received = await new Promise<string[]>((resolveMessages, reject) => {
        const messages: string[] = [];
        socket = new WebSocket(`ws://127.0.0.1:${port}/ws`);
        socket.onopen = () => socket!.send('Hello');
        socket.onerror = () => reject(new Error('WebSocket failed to connect'));
        socket.onmessage = (event) => {
          messages.push(String(event.data));
          if (messages.length === 2) resolveMessages(messages);
        };
      });
      expect(received).toEqual(['Connected to Volt', 'Echo: Hello']);
    } finally {
      socket?.close();
      child.kill();
      await child.exited;
    }
  });

  test('DI, modules, mock clients, GraphQL and errors behave as documented', async () => {
    expect((await (await client('di').get('/products')).json()).products[0].title).toBe('Coffee');
    expect((await client('modules').get('/products')).status).toBe(200);
    expect((await (await client('postgres-memory').get('/database-check')).json()).mode).toBe('mock');
    expect((await (await client('redis-memory').get('/stats')).json()).source).toBe('computed');
    expect((await (await client('redis-memory').get('/stats')).json()).source).toBe('cache');
    expect(await (await client('graphql').post('/graphql', { body: { query: '{ greeting(name: "Chansy") }' } })).json()).toEqual({ data: { greeting: 'Hello Chansy' } });
    expect((await client('errors').get('/users/42')).status).toBe(404);
  });
});
