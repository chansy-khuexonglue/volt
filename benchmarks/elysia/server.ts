/**
 * Equivalent Elysia benchmark server fixture.
 * Compatible with Bun runtime and standard Elysia patterns.
 */
export function createElysiaBenchmarkConfig() {
  return {
    name: 'Elysia',
    routes: {
      ping: '/ping',
      dynamic: '/users/:id',
      postItems: '/items',
    },
  };
}

// Runnable if elysia package is present in environment
try {
  const { Elysia, t } = await import('elysia' as any);
  const app = new Elysia()
    .get('/ping', () => ({ message: 'pong' }))
    .get('/users/:id', ({ params }: any) => ({
      id: params.id,
      name: `User ${params.id}`,
    }))
    .post('/items', ({ body }: any) => ({
      success: true,
      data: body,
    }), {
      body: t.Object({
        title: t.String(),
        price: t.Number(),
      }),
    });

  if (import.meta.main) {
    app.listen(4002);
    console.log('Elysia benchmark server listening on port 4002');
  }
} catch {
  // Optional dependency
}
