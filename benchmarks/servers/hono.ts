import { Hono } from 'hono';

export function createHonoServer(port = 4003) {
  const app = new Hono();

  // 1. Static route
  app.get('/ping', (c) => c.json({ message: 'pong' }));

  // 2. Dynamic route param
  app.get('/users/:id', (c) => {
    const id = c.req.param('id');
    return c.json({ id, name: `User ${id}` });
  });

  // 3. Validated JSON body
  app.post('/items', async (c) => {
    const body = await c.req.json();
    return c.json({ success: true, data: body });
  });

  return app;
}
