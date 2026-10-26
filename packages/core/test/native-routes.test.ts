import { expect, test } from 'bun:test';
import { Volt, t } from '../src/index';

test('native static GET runs per request and preserves method routing and async results', async () => {
  const app = new Volt({ port: 0, hostname: '127.0.0.1' });
  let count = 0;
  app.get('/counter', () => ({ count: ++count }));
  app.get('/async', async () => ({ ok: true }));
  app.post('/counter', (c) => c.json({ posted: c.body }, 201));
  app.head('/counter', (c) => c.text('explicit', 202));
  app.get('/users/:id', (c) => c.json({ id: c.params.id }));
  app.get('/validated', () => ({ ok: true }), { query: t.Object({ key: t.String() }) });
  const server = app.listen();
  const base = `http://127.0.0.1:${server.port}`;
  try {
    expect(await (await fetch(`${base}/counter`)).json()).toEqual({ count: 1 });
    expect(await (await fetch(`${base}/counter`)).json()).toEqual({ count: 2 });
    expect(await (await fetch(`${base}/async`)).json()).toEqual({ ok: true });
    expect((await fetch(`${base}/counter`, { method: 'HEAD' })).status).toBe(202);
    expect((await fetch(`${base}/counter`, { method: 'POST', headers: {'content-type':'application/json'},body:'{}' })).status).toBe(201);
    expect((await fetch(`${base}/counter`, { method: 'OPTIONS' })).status).toBe(204);
    expect((await fetch(`${base}/counter`, { method: 'DELETE' })).status).toBe(404);
    expect((await fetch(`${base}/validated`)).status).toBe(400);
    expect(await (await fetch(`${base}/users/42`)).json()).toEqual({ id: '42' });
    expect((await fetch(`${base}/unknown`)).status).toBe(404);
  } finally { await app.stop(); }
});

test('native handlers preserve errors, request access and middleware', async () => {
  const app = new Volt({port:0,hostname:'127.0.0.1'});
  app.onError((_error, request) => Response.json({path:new URL(request.url).pathname},{status:503}));
  app.get('/throw', () => { throw Error('sync'); });
  app.get('/reject', async () => { throw Error('async'); });
  app.use((_c, next) => new Response('guard', {status:401}));
  app.get('/guarded', () => ({ secret:true }));
  const server = app.listen();
  try {
    for (const path of ['/throw','/reject']) {
      const response=await fetch(`http://127.0.0.1:${server.port}${path}`);
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({path});
    }
    expect((await fetch(`http://127.0.0.1:${server.port}/guarded`)).status).toBe(401);
  } finally { await app.stop(); }
});

test('native and JS dispatch agree on path and method edge cases', async () => {
  const apps = [false, true].map((nativeRoutes) => {
    const app = new Volt({port:0,hostname:'127.0.0.1',nativeRoutes});
    app.get('/ping', () => ({ok:true}));
    app.get('/ping/deep', () => ({deep:true}));
    app.add('TRACE','/ping', () => 'trace');
    return {app,server:app.listen()};
  });
  try {
    for(const path of ['/ping','/ping/','/PING','//ping','/p%69ng','/ping?key=value','/ping/deep','/ping/nope']) {
      for(const method of ['GET','HEAD','OPTIONS','POST','TRACE']) {
        const responses=await Promise.all(apps.map(async ({server}) => {
          const response=await fetch(`http://127.0.0.1:${server.port}${path}`,{method});
          return {status:response.status,body:await response.text(),type:response.headers.get('content-type'),allow:response.headers.get('allow')};
        }));
        expect(responses[1]).toEqual(responses[0]);
      }
    }
  } finally { for(const {app} of apps) await app.stop(); }
});
