import Fastify from 'fastify';

export async function createFastifyServer(port = 4005) {
  const app = Fastify({ logger: false });

  // 1. Static route
  app.get('/ping', async () => ({ message: 'pong' }));

  // 2. Dynamic route param
  app.get('/users/:id', async (req: any) => ({
    id: req.params.id,
    name: `User ${req.params.id}`,
  }));

  // 3. Validated JSON body
  app.post(
    '/items',
    {
      schema: {
        body: {
          type: 'object',
          required: ['title', 'price'],
          properties: {
            title: { type: 'string', minLength: 2 },
            price: { type: 'number', minimum: 0 },
          },
        },
      },
    },
    async (req: any) => ({
      success: true,
      data: req.body,
    })
  );

  await app.listen({ port, host: '127.0.0.1' });
  return app;
}
