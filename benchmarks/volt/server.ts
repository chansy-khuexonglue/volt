import { t, Volt } from '../../packages/volt/src/index';

export function createVoltBenchmarkServer(port = 4001): Volt {
  const app = new Volt({ port });

  // 1. Static route
  app.get('/ping', () => ({ message: 'pong' }));

  // 2. Dynamic param
  app.get('/users/:id', (c) => ({
    id: c.params.id,
    name: `User ${c.params.id}`,
  }));

  // 3. Validated JSON body
  app.post(
    '/items',
    (c) => ({
      success: true,
      data: c.body,
    }),
    {
      body: t.Object({
        title: t.String({ minLength: 2 }),
        price: t.Number({ min: 0 }),
      }),
    }
  );

  return app;
}

if (import.meta.main) {
  const port = Number(process.env.PORT) || 4001;
  const server = createVoltBenchmarkServer(port);
  server.listen(port, () => {
    console.log(`⚡ Volt benchmark server listening on port ${port}`);
  });
}
