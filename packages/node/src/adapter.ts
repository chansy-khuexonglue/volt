import type { IncomingMessage, ServerResponse } from 'node:http';
import * as http from 'node:http';
import { Volt } from '@voltts/core';

export interface NodeServerOptions {
  port?: number;
  hostname?: string;
}

export function nodeRequestToWebRequest(req: IncomingMessage, baseUrl: string): Request {
  const method = req.method || 'GET';
  const url = new URL(req.url || '/', baseUrl).toString();

  const headers = new Headers();
  for (const [key, val] of Object.entries(req.headers)) {
    if (val !== undefined) {
      if (Array.isArray(val)) {
        val.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, val);
      }
    }
  }

  const hasBody = !['GET', 'HEAD'].includes(method.toUpperCase());

  let body: ReadableStream<Uint8Array> | null = null;
  if (hasBody) {
    body = new ReadableStream<Uint8Array>({
      start(controller) {
        req.on('data', (chunk) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        req.on('end', () => {
          controller.close();
        });
        req.on('error', (err) => {
          controller.error(err);
        });
      },
    });
  }

  // Cast for standard Node Request
  return new Request(url, {
    method,
    headers,
    body: hasBody ? (body as any) : null,
    // @ts-ignore
    duplex: hasBody ? 'half' : undefined,
  });
}

export async function writeWebResponseToNodeResponse(
  webRes: Response,
  nodeRes: ServerResponse
): Promise<void> {
  nodeRes.statusCode = webRes.status;
  webRes.headers.forEach((val, key) => {
    nodeRes.setHeader(key, val);
  });

  if (!webRes.body) {
    nodeRes.end();
    return;
  }

  const reader = webRes.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        nodeRes.write(value);
      }
    }
  } finally {
    nodeRes.end();
  }
}

export function createNodeHandler(app: Volt, hostname = 'localhost') {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const port = (req.socket.localPort) || 3000;
    const protocol = (req.socket as any).encrypted ? 'https' : 'http';
    const baseUrl = `${protocol}://${hostname}:${port}`;

    try {
      const webReq = nodeRequestToWebRequest(req, baseUrl);
      const webRes = await app.handle(webReq);
      await writeWebResponseToNodeResponse(webRes, res);
    } catch (err: any) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
    }
  };
}

export function createNodeServer(app: Volt, options: NodeServerOptions = {}): http.Server {
  const handler = createNodeHandler(app, options.hostname || 'localhost');
  return http.createServer(handler);
}

export function serve(app: Volt, options: NodeServerOptions = {}, callback?: (server: http.Server) => void): http.Server {
  const port = options.port !== undefined ? options.port : 3000;
  const hostname = options.hostname || '0.0.0.0';
  const server = createNodeServer(app, options);

  server.listen(port, hostname, () => {
    if (callback) callback(server);
  });

  return server;
}
