/**
 * Equivalent Hono benchmark server fixture.
 * Compatible with Bun runtime and standard Hono patterns.
 */
export function createHonoBenchmarkConfig() {
  return {
    name: 'Hono',
    routes: {
      ping: '/ping',
      dynamic: '/users/:id',
      postItems: '/items',
    },
  };
}

// Runnable if hono package is present in environment
try {
  const { Hono } = await import('hono' as any);
  const app = new Hono();

  app.get('/ping', (c: any) => c.json({ message: 'pong' }));
  app.get('/users/:id', (c: any) =>
    c.json({
      id: c.req.param('id'),
      name: `User ${c.req.param('id')}`,
    })
  );
  app.post('/items', async (c: any) => {
    const body = await c.req.json();
    return c.json({ success: true, data: body });
  });

  if (import.meta.main) {
    // @ts-ignore
    Bun.serve({
      fetch: app.fetch,
      port: 4003,
    });
    console.log('Hono benchmark server listening on port 4003');
  }
} catch {
  // Optional dependency
}
