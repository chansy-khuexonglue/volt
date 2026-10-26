import { describe, expect, it } from 'bun:test';
import { html, json, serializeResponse, text } from '../src/index';

describe('@voltts/serializer', () => {
  it('serializes JSON responses with correct headers', async () => {
    const res = json({ hello: 'volt' }, 201);
    expect(res.status).toBe(201);
    expect(res.headers.get('content-type')).toContain('application/json');
    const data = await res.json();
    expect(data).toEqual({ hello: 'volt' });
  });

  it('serializes text responses', async () => {
    const res = text('Plain text response', 200);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/plain');
    expect(await res.text()).toBe('Plain text response');
  });

  it('serializes HTML responses', async () => {
    const res = html('<h1>Volt</h1>', 200);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(await res.text()).toBe('<h1>Volt</h1>');
  });

  it('automatically detects and serializes arbitrary handler return values', async () => {
    // 1. Primitive string
    const resStr = serializeResponse('hello');
    expect(resStr.headers.get('content-type')).toContain('text/plain');
    expect(await resStr.text()).toBe('hello');

    // 2. Object
    const resObj = serializeResponse({ a: 1 });
    expect(resObj.headers.get('content-type')).toContain('application/json');
    expect(await resObj.json()).toEqual({ a: 1 });

    // 3. Null / Undefined -> 204 No Content
    const resNull = serializeResponse(null);
    expect(resNull.status).toBe(204);

    // 4. Pass-through Response
    const raw = new Response('raw', { status: 418 });
    const resRaw = serializeResponse(raw);
    expect(resRaw.status).toBe(418);
  });
});
