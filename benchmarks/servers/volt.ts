import { Volt, t } from '../../packages/volt/src/index';

export function createVoltServer(port = 4001) {
  const app = new Volt({ port });

  // 1. Static route
  app.get('/ping', () => ({ message: 'pong' }));

  // 2. Dynamic route param
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
