import { Elysia, t } from 'elysia';

export function createElysiaServer(port = 4002) {
  const app = new Elysia()
    .get('/ping', () => ({ message: 'pong' }))
    .get('/users/:id', ({ params }) => ({
      id: params.id,
      name: `User ${params.id}`,
    }))
    .post(
      '/items',
      ({ body }) => ({
        success: true,
        data: body,
      }),
      {
        body: t.Object({
          title: t.String({ minLength: 2 }),
          price: t.Number({ minimum: 0 }),
        }),
      }
    );

  return app;
}
