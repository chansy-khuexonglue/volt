import { describe, expect, it } from 'bun:test';
import { Volt } from '../src/index';

describe('@volt/core Multipart & File Uploads', () => {
  it('parses multipart form data with fields and files', async () => {
    const app = new Volt();

    app.post('/upload', async (c) => {
      const file = await c.file('avatar');
      const author = (c.body as any).author;

      if (!file) {
        return c.json({ error: 'No file uploaded' }, 400);
      }

      return c.json({
        filename: file.name,
        size: file.size,
        type: file.type,
        author,
        text: await file.text(),
      });
    });

    const formData = new FormData();
    const fileContent = 'Hello Volt framework file upload!';
    const blob = new Blob([fileContent], { type: 'text/plain' });
    formData.append('avatar', blob, 'hello.txt');
    formData.append('author', 'Alice');

    const req = new Request('http://localhost/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await app.handle(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.filename).toBe('hello.txt');
    expect(data.size).toBe(fileContent.length);
    expect(data.author).toBe('Alice');
    expect(data.text).toBe(fileContent);
  });

  it('retrieves multiple files using c.files()', async () => {
    const app = new Volt();

    app.post('/multi-upload', async (c) => {
      const files = await c.files('docs');
      return c.json({
        count: files.length,
        names: files.map((f) => f.name),
      });
    });

    const formData = new FormData();
    formData.append('docs', new Blob(['doc 1']), 'doc1.pdf');
    formData.append('docs', new Blob(['doc 2']), 'doc2.pdf');

    const req = new Request('http://localhost/multi-upload', {
      method: 'POST',
      body: formData,
    });

    const res = await app.handle(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.count).toBe(2);
    expect(data.names).toEqual(['doc1.pdf', 'doc2.pdf']);
  });

  it('rejects payloads exceeding maxRequestBodySize with 413 Payload Too Large', async () => {
    const app = new Volt({
      maxRequestBodySize: 100, // 100 bytes limit
    });

    app.post('/limited', (c) => c.json({ ok: true }));

    const largePayload = JSON.stringify({ data: 'x'.repeat(200) });
    const req = new Request('http://localhost/limited', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': String(largePayload.length),
      },
      body: largePayload,
    });

    const res = await app.handle(req);
    expect(res.status).toBe(413);

    const err = await res.json();
    expect(err.error).toBe('PayloadTooLargeError');
  });
});
