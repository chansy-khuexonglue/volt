import { expect, test } from 'bun:test';
import { Volt, t } from '../src/index';
import { logger } from '../../middleware/src/logger';

test('invalid null body returns 400 through the network server and logger', async () => {
  const logs: string[] = [];
  const app = new Volt({ port: 0, hostname: '127.0.0.1' });
  app.use(logger({ log: (line: string) => logs.push(line) }));
  app.post('/items', (c) => c.json(c.body), { body: t.Object({ name: t.String() }) });
  const server = app.listen();
  try {
    const response = await fetch(`http://127.0.0.1:${server.port}/items`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: 'null',
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ status: 400, message: 'Invalid request body' });
    expect(logs.some((line) => line.includes('400'))).toBe(true);
  } finally { await app.stop(); }
});

test('nullable schema explicitly accepts a null JSON body', async () => {
  const app = new Volt();
  app.post('/items', (c) => c.json({ isNull: c.body === null }), {
    body: t.Nullable(t.Object({ name: t.String() })),
  });
  const response = await app.handle(new Request('http://localhost/items', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: 'null',
  }));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ isNull: true });
});
