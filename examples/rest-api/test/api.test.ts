import { beforeAll, describe, expect, it } from 'bun:test';
import { createTestClient } from 'volt';
import { createApplication } from '../src/app';

describe('REST API Integration Tests', () => {
  const app = createApplication();
  const client = createTestClient(app);

  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    // 1. Authenticate admin user
    const adminRes = await client.post('/api/v1/auth/login', {
      body: {
        email: 'admin@volt.sh',
        password: 'admin123',
      },
    });
    const adminJson = await adminRes.json();
    adminToken = adminJson.token;

    // 2. Register and authenticate standard user
    await client.post('/api/v1/auth/register', {
      body: {
        name: 'Regular Tester',
        email: 'tester@volt.sh',
        password: 'password123',
        role: 'user',
      },
    });

    const userRes = await client.post('/api/v1/auth/login', {
      body: {
        email: 'tester@volt.sh',
        password: 'password123',
      },
    });
    const userJson = await userRes.json();
    userToken = userJson.token;
  });

  describe('Core Endpoints & Documentation', () => {
    it('GET / returns root API summary', async () => {
      const res = await client.get('/');
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.name).toBe('⚡ Volt Enterprise REST API');
      expect(json.status).toBe('online');
      expect(json.documentation.swagger).toContain('/swagger');
      expect(json.documentation.scalar).toContain('/docs');
    });

    it('GET /health returns health status and metrics', async () => {
      const res = await client.get('/health');
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.status).toBe('healthy');
      expect(json.timestamp).toBeDefined();
      expect(json.memoryRssMb).toBeGreaterThan(0);
    });

    it('GET /openapi.json returns valid OpenAPI 3.0.3 specification', async () => {
      const res = await client.get('/openapi.json');
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.openapi).toBe('3.0.3');
      expect(json.info.title).toContain('Volt Enterprise');
      expect(json.paths['/api/v1/products']).toBeDefined();
      expect(json.paths['/api/v1/auth/login']).toBeDefined();
    });

    it('GET /swagger returns Swagger UI HTML with CSP header', async () => {
      const res = await client.get('/swagger');
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('text/html');
      expect(res.headers.get('content-security-policy')).toContain('unpkg.com');

      const text = await res.text();
      expect(text).toContain('SwaggerUIBundle');
      expect(text).toContain('id="swagger-ui"');
    });

    it('GET /docs returns Scalar UI HTML with inlined spec', async () => {
      const res = await client.get('/docs');
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('text/html');
      expect(res.headers.get('content-security-policy')).toContain('cdn.jsdelivr.net');

      const text = await res.text();
      expect(text).toContain('@scalar/api-reference');
      expect(text).toContain('id="api-reference"');
    });
  });

  describe('Authentication Routes', () => {
    it('POST /api/v1/auth/login with wrong password returns 401', async () => {
      const res = await client.post('/api/v1/auth/login', {
        body: {
          email: 'admin@volt.sh',
          password: 'wrongpassword',
        },
      });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('GET /api/v1/auth/me without token returns 401', async () => {
      const res = await client.get('/api/v1/auth/me');
      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('GET /api/v1/auth/me with valid Bearer token returns profile', async () => {
      const res = await client.get('/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.authenticated).toBe(true);
      expect(json.user.email).toBe('admin@volt.sh');
      expect(json.user.role).toBe('admin');
    });
  });

  describe('Product CRUD & RBAC Authorization', () => {
    let createdProductId: string;

    it('GET /api/v1/products returns all products', async () => {
      const res = await client.get('/api/v1/products');
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.count).toBeGreaterThanOrEqual(3);
      expect(Array.isArray(json.items)).toBe(true);
    });

    it('GET /api/v1/products with category filter', async () => {
      const res = await client.get('/api/v1/products', {
        query: { category: 'Electronics' },
      });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.items.length).toBeGreaterThanOrEqual(1);
      expect(json.items.every((p: any) => p.category === 'Electronics')).toBe(true);
    });

    it('GET /api/v1/products/:id returns single product', async () => {
      const res = await client.get('/api/v1/products/prod_1');
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.id).toBe('prod_1');
      expect(json.name).toContain('Keychron');
    });

    it('GET /api/v1/products/:id returns 404 for unknown id', async () => {
      const res = await client.get('/api/v1/products/unknown_xyz');
      expect(res.status).toBe(404);

      const json = await res.json();
      expect(json.error).toBe('NotFound');
    });

    it('POST /api/v1/products fails with 401 when unauthenticated', async () => {
      const res = await client.post('/api/v1/products', {
        body: {
          name: 'Unauthorized Product',
          price: 99.99,
          stock: 10,
          category: 'Hardware',
        },
      });

      expect(res.status).toBe(401);
    });

    it('POST /api/v1/products fails with 403 when authenticated as non-admin', async () => {
      const res = await client.post('/api/v1/products', {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          name: 'Forbidden Product',
          price: 99.99,
          stock: 10,
          category: 'Hardware',
        },
      });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe('Forbidden');
    });

    it('POST /api/v1/products fails with 400 on invalid body schema', async () => {
      const res = await client.post('/api/v1/products', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: {
          name: 'P', // too short (minLength 2)
          price: -5,  // negative price (min 0.01)
          stock: 'invalid', // not an integer
          category: '',
        },
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('BadRequestError');
    });

    it('POST /api/v1/products succeeds with 201 for admin role', async () => {
      const res = await client.post('/api/v1/products', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: {
          name: 'Sony WH-1000XM5 Headphones',
          description: 'Industry-leading noise canceling wireless headphones',
          price: 399.99,
          stock: 30,
          category: 'Audio',
        },
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.id).toBeDefined();
      expect(json.name).toBe('Sony WH-1000XM5 Headphones');
      expect(json.price).toBe(399.99);

      createdProductId = json.id;
    });

    it('PUT /api/v1/products/:id updates product for admin', async () => {
      const res = await client.put(`/api/v1/products/${createdProductId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: {
          price: 349.99,
          stock: 25,
        },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.price).toBe(349.99);
      expect(json.stock).toBe(25);
    });

    it('DELETE /api/v1/products/:id deletes product for admin', async () => {
      const res = await client.delete(`/api/v1/products/${createdProductId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      // Verify it's deleted
      const checkRes = await client.get(`/api/v1/products/${createdProductId}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
