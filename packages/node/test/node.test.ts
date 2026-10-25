import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import * as http from 'node:http';
import { Volt } from '@volt/core';
import { serve } from '../src/index';

describe('@volt/node Adapter', () => {
  let server: http.Server;
  let port: number;

  beforeAll(async () => {
    const app = new Volt();

    app.get('/hello', () => ({ message: 'Hello from Node adapter!' }));

    app.post('/echo', (c) => ({
      received: c.body,
    }));

    await new Promise<void>((resolve) => {
      // Use port 0 for random free port
      server = serve(app, { port: 0, hostname: '127.0.0.1' }, (s) => {
        const address = s.address() as any;
        port = address.port;
        resolve();
      });
    });
  });

  afterAll((done) => {
    if (server) {
      server.close(() => done());
    } else {
      done();
    }
  });

  it('handles GET requests on Node HTTP server', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/hello`);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.message).toBe('Hello from Node adapter!');
  });

  it('handles POST requests with JSON payload on Node HTTP server', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/echo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Volt on Node' }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received.name).toBe('Volt on Node');
  });
});
