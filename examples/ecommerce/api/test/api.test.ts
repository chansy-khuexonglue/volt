import { describe, expect, it } from 'bun:test';
import { createApplication } from '../src/app';

describe('🛒 Volt eCommerce REST API', () => {
  const app = createApplication();

  it('loads DATABASE_URL from .env and registers Prisma plugin on Volt application', () => {
    expect((app as any).prisma).toBeDefined();
    expect(app.store.prisma).toBeDefined();
    expect(typeof (app as any).prisma.$connect).toBe('function');
  });

  it('GET /health returns 200 with database status connected and Prisma ORM reported', async () => {
    const res = await app.fetch(new Request('http://localhost:3000/health'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.database).toBe('connected');
    expect(body.orm).toBe('Prisma Plugin (@volt/plugin-prisma)');
    expect(body.framework).toBe('Volt');
  });

  it('OPTIONS /api/products returns 204 with full CORS preflight headers', async () => {
    const req = new Request('http://localhost:3000/api/products', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3001',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'x-session-id',
      },
    });
    const res = await app.fetch(req);
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3001');
    expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    expect(res.headers.get('Access-Control-Allow-Headers')).toContain('x-session-id');
  });

  it('GET /api/categories returns categories list', async () => {
    const res = await app.fetch(new Request('http://localhost:3000/api/categories'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.count).toBeGreaterThan(0);
  });

  it('GET /api/categories/:slug returns category and products', async () => {
    const res = await app.fetch(new Request('http://localhost:3000/api/categories/audio'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBe('Smart Audio & Sound');
    expect(Array.isArray(body.products)).toBe(true);
  });

  it('GET /api/products returns products catalog with pagination', async () => {
    const res = await app.fetch(new Request('http://localhost:3000/api/products?limit=2'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.length).toBeLessThanOrEqual(2);
    expect(body.total).toBeGreaterThan(0);
  });

  it('GET /api/products/featured returns featured products', async () => {
    const res = await app.fetch(new Request('http://localhost:3000/api/products/featured'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('GET /api/products/:id returns single product', async () => {
    const res = await app.fetch(new Request('http://localhost:3000/api/products/prod-sony-wh1000xm5'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.title).toContain('Sony WH-1000XM5');
  });

  it('GET /api/products/:id/reviews returns reviews list', async () => {
    const res = await app.fetch(new Request('http://localhost:3000/api/products/prod-sony-wh1000xm5/reviews'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('handles Cart lifecycle (add, get, update, remove, clear)', async () => {
    const sessionId = `test-cart-${Date.now()}`;
    const headers = {
      'content-type': 'application/json',
      'x-session-id': sessionId,
    };

    // 1. Add item
    const addRes = await app.fetch(
      new Request('http://localhost:3000/api/cart/items', {
        method: 'POST',
        headers,
        body: JSON.stringify({ productId: 'prod-sony-wh1000xm5', quantity: 2 }),
      })
    );
    expect(addRes.status).toBe(200);
    const addBody = await addRes.json();
    expect(addBody.data.itemCount).toBe(2);

    // 2. Get cart
    const getRes = await app.fetch(new Request('http://localhost:3000/api/cart', { headers }));
    const getBody = await getRes.json();
    expect(getBody.data.items.length).toBe(1);

    // 3. Update quantity
    const updateRes = await app.fetch(
      new Request('http://localhost:3000/api/cart/items/prod-sony-wh1000xm5', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ quantity: 1 }),
      })
    );
    const updateBody = await updateRes.json();
    expect(updateBody.data.itemCount).toBe(1);

    // 4. Remove item
    const removeRes = await app.fetch(
      new Request('http://localhost:3000/api/cart/items/prod-sony-wh1000xm5', {
        method: 'DELETE',
        headers,
      })
    );
    const removeBody = await removeRes.json();
    expect(removeBody.data.itemCount).toBe(0);
  });

  it('places order via checkout and retrieves it', async () => {
    const checkoutRes = await app.fetch(
      new Request('http://localhost:3000/api/orders/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          customerName: 'Test Customer',
          customerEmail: 'test@example.com',
          items: [
            {
              product_id: 'prod-sony-wh1000xm5',
              title: 'Sony Headphones',
              price: 399.99,
              quantity: 1,
              image: 'https://example.com/test.jpg',
            },
          ],
          shippingAddress: {
            full_name: 'Test Customer',
            email: 'test@example.com',
            address: '123 Market St',
            city: 'San Francisco',
            postal_code: '94103',
            country: 'USA',
          },
          paymentMethod: 'stripe',
        }),
      })
    );

    expect(checkoutRes.status).toBe(201);
    const checkoutBody = await checkoutRes.json();
    expect(checkoutBody.success).toBe(true);
    expect(checkoutBody.data.order_number).toBeDefined();

    // Query order
    const orderRes = await app.fetch(
      new Request(`http://localhost:3000/api/orders/${checkoutBody.data.order_number}`)
    );
    expect(orderRes.status).toBe(200);
    const orderBody = await orderRes.json();
    expect(orderBody.data.customer_name).toBe('Test Customer');
  });

  it('POST /api/products/:id/reviews creates a review using Prisma Client', async () => {
    const res = await app.fetch(
      new Request('http://localhost:3000/api/products/prod-sony-wh1000xm5/reviews', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          userName: 'Alex Dev',
          rating: 5,
          title: 'Phenomenal Sound Quality',
          comment: 'Noise cancellation is best in class.',
        }),
      })
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.user_name).toBe('Alex Dev');
    expect(body.data.rating).toBe(5);
  });

  it('handles auth lifecycle with Prisma (register, login, getMe)', async () => {
    const testEmail = `user_${Date.now()}@volt-ecommerce.dev`;
    const testPassword = 'SecurePassword123!';

    // 1. Register
    const regRes = await app.fetch(
      new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Jane Doe',
          email: testEmail,
          password: testPassword,
        }),
      })
    );
    expect(regRes.status).toBe(201);
    const regBody = await regRes.json();
    expect(regBody.success).toBe(true);
    expect(regBody.user.email).toBe(testEmail);
    expect(regBody.token).toBeDefined();

    const token = regBody.token;

    // 2. Login
    const loginRes = await app.fetch(
      new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      })
    );
    expect(loginRes.status).toBe(200);
    const loginBody = await loginRes.json();
    expect(loginBody.success).toBe(true);
    expect(loginBody.token).toBeDefined();

    // 3. Me
    const meRes = await app.fetch(
      new Request('http://localhost:3000/api/auth/me', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
    );
    expect(meRes.status).toBe(200);
    const meBody = await meRes.json();
    expect(meBody.success).toBe(true);
    expect(meBody.user.email).toBe(testEmail);
  });

  it('allows direct Prisma ORM operations via Volt context store', async () => {
    const prisma = app.store.prisma;
    const productCount = await prisma.product.count();
    expect(productCount).toBeGreaterThan(0);

    const categories = await prisma.category.findMany({
      include: {
        products: {
          take: 1,
        },
      },
    });
    expect(categories.length).toBeGreaterThan(0);
    expect(Array.isArray(categories[0].products)).toBe(true);
  });
});

