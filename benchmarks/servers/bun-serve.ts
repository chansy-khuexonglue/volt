export function createBunServeHandler() {
  return async function fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    if (req.method === 'GET' && path === '/ping') {
      return Response.json({ message: 'pong' });
    }

    if (req.method === 'GET' && path.startsWith('/users/')) {
      const id = path.slice(7);
      return Response.json({ id, name: `User ${id}` });
    }

    if (req.method === 'POST' && path === '/items') {
      const body = await req.json();
      return Response.json({ success: true, data: body });
    }

    return new Response('Not Found', { status: 404 });
  };
}

export function createBunServeServer(port = 4004) {
  const handler = createBunServeHandler();
  return Bun.serve({
    port,
    fetch: handler,
  });
}
