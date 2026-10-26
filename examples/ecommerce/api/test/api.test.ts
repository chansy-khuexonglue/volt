import { describe, expect, it } from 'bun:test';
import { createApplication } from '../src/app';

describe('🛒 Volt eCommerce REST API', () => {
  const app = createApplication();

  it('GET /health returns 200 with database status connected', async () => {
    const res = await app.fetch(new Request('http://localhost:3000/health'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.database).toBe('connected');
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
});
