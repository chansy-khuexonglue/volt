import { describe, expect, it } from 'bun:test';
import { cors, createTestClient, logger, t, Volt } from '../src/index';

describe('volt (unified package)', () => {
  it('allows end-to-end API definition using top-level volt imports', async () => {
    const app = new Volt();

    app.use(cors());
    app.use(logger({ log: () => {} }));

    app.get('/', () => ({ message: '⚡ Powered by Volt' }));

    app.post(
      '/items',
      (c) => c.json({ item: c.body, id: 1 }, 201),
      {
        body: t.Object({
          title: t.String({ minLength: 1 }),
          price: t.Number({ min: 0 }),
        }),
      }
    );

    const client = createTestClient(app);

    const res1 = await client.get('/');
    expect(res1.status).toBe(200);
    expect(await res1.json()).toEqual({ message: '⚡ Powered by Volt' });

    const res2 = await client.post('/items', {
      body: { title: 'Coffee', price: 3.5 },
    });
    expect(res2.status).toBe(201);
    const data = await res2.json();
    expect(data.item.title).toBe('Coffee');
    expect(data.id).toBe(1);
  });
});
