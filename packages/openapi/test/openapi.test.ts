import { describe, expect, it } from 'bun:test';
import { Volt } from '../../core/src/index';
import { createTestClient } from '../../testing/src/index';
import { t } from '../../validator/src/index';
import { openapi, swagger } from '../src/index';

describe('@volt/openapi', () => {
  it('generates OpenAPI specification and Scalar UI endpoints', async () => {
    const app = new Volt();

    app.use(
      openapi({
        info: { title: 'Test API', version: '2.0.0' },
        path: '/docs',
        specPath: '/openapi.json',
      })
    );

    app.get(
      '/users/:id',
      (c) => ({ id: c.params.id }),
      {
        summary: 'Get user by ID',
        params: t.Object({ id: t.String() }),
      }
    );

    app.post(
      '/users',
      (c) => ({ created: true }),
      {
        summary: 'Create user',
        body: t.Object({
          name: t.String({ minLength: 2 }),
          email: t.String({ format: 'email' }),
        }),
      }
    );

    const client = createTestClient(app);

    // 1. Fetch OpenAPI spec
    const specRes = await client.get('/openapi.json');
    expect(specRes.status).toBe(200);
    const spec = await specRes.json();

    expect(spec.openapi).toBe('3.0.3');
    expect(spec.info.title).toBe('Test API');
    expect(spec.paths['/users/{id}']).toBeDefined();
    expect(spec.paths['/users/{id}'].get.summary).toBe('Get user by ID');
    expect(spec.paths['/users'].post.requestBody).toBeDefined();

    // 2. Fetch Docs UI (Scalar)
    const docsRes = await client.get('/docs');
    expect(docsRes.status).toBe(200);
    expect(docsRes.headers.get('content-type')).toContain('text/html');
    const html = await docsRes.text();
    expect(html).toContain('Test API');

    // 3. Fetch Swagger UI (/swagger)
    const swaggerRes = await client.get('/swagger');
    expect(swaggerRes.status).toBe(200);
    expect(swaggerRes.headers.get('content-type')).toContain('text/html');
    const swaggerHtml = await swaggerRes.text();
    expect(swaggerHtml).toContain('SwaggerUIBundle');
    expect(swaggerHtml).toContain('SwaggerUIStandalonePreset');
  });

  it('provides dedicated swagger() plugin', async () => {
    const app = new Volt();

    app.use(
      swagger({
        info: { title: 'Swagger Dedicated API', version: '1.0.0' },
        path: '/custom-swagger',
      })
    );

    app.get('/ping', () => 'pong', { summary: 'Ping' });

    const client = createTestClient(app);

    const res = await client.get('/custom-swagger');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('SwaggerUIBundle');
    expect(html).toContain('Swagger Dedicated API');
  });
});
