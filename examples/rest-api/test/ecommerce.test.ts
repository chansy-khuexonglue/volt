import { beforeAll, describe, expect, it } from 'bun:test';
import { createTestClient } from 'volt';
import { createApplication } from '../src/app';

describe('eCommerce Full Lifecycle Integration Tests', () => {
  const app = createApplication();
  const client = createTestClient(app);

  let customerToken: string;
  let adminToken: string;
  let targetProductId: string;
  let createdOrderId: string;

  beforeAll(async () => {
    // 1. Authenticate demo customer
    const customerLogin = await client.post('/api/v1/auth/login', {
      body: {
        email: 'demo@volt.sh',
        password: 'demo123',
      },
    });
    const customerData = await customerLogin.json();
    customerToken = customerData.token;

    // 2. Authenticate admin user
    const adminLogin = await client.post('/api/v1/auth/login', {
      body: {
        email: 'admin@volt.sh',
        password: 'admin123',
      },
    });
    const adminData = await adminLogin.json();
    adminToken = adminData.token;
  });

  describe('1. Catalog & Taxonomy Browsing', () => {
    it('GET /api/v1/categories returns list of categories', async () => {
      const res = await client.get('/api/v1/categories');
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.count).toBeGreaterThanOrEqual(3);
      expect(json.items.some((c: any) => c.slug === 'electronics')).toBe(true);
    });

    it('GET /api/v1/products filters by category and sets target product', async () => {
      const res = await client.get('/api/v1/products', {
        query: { category: 'Electronics' },
      });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.count).toBeGreaterThanOrEqual(1);

      targetProductId = json.items[0].id;
      expect(targetProductId).toBeDefined();
    });

    it('GET /api/v1/products automatically coerces numeric query parameters like limit and minPrice', async () => {
      const res = await client.get('/api/v1/products', {
        query: { limit: '2', minPrice: '100' },
      });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.count).toBeLessThanOrEqual(2);
      expect(json.items.every((p: any) => p.price >= 100)).toBe(true);
    });

    it('GET /api/v1/products/:id/reviews lists product reviews and average rating', async () => {
      const res = await client.get(`/api/v1/products/${targetProductId}/reviews`);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.productId).toBe(targetProductId);
      expect(typeof json.averageRating).toBe('number');
      expect(Array.isArray(json.reviews)).toBe(true);
    });
  });

  describe('2. Shopping Cart Workflow', () => {
    it('GET /api/v1/cart returns initial empty or active cart for customer', async () => {
      const res = await client.get('/api/v1/cart', {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.userId).toBe('usr_demo');
      expect(Array.isArray(json.items)).toBe(true);
    });

    it('POST /api/v1/cart/items adds product to cart and updates subtotal', async () => {
      const res = await client.post('/api/v1/cart/items', {
        headers: { Authorization: `Bearer ${customerToken}` },
        body: {
          productId: targetProductId,
          quantity: 2,
        },
      });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.itemCount).toBeGreaterThanOrEqual(2);
      expect(json.totalPrice).toBeGreaterThan(0);

      const item = json.items.find((i: any) => i.productId === targetProductId);
      expect(item).toBeDefined();
      expect(item.quantity).toBe(2);
    });

    it('PUT /api/v1/cart/items/:productId updates quantity in cart', async () => {
      const res = await client.put(`/api/v1/cart/items/${targetProductId}`, {
        headers: { Authorization: `Bearer ${customerToken}` },
        body: {
          quantity: 1,
        },
      });
      expect(res.status).toBe(200);

      const json = await res.json();
      const item = json.items.find((i: any) => i.productId === targetProductId);
      expect(item.quantity).toBe(1);
    });
  });

  describe('3. Order Checkout & Stock Management', () => {
    let initialStock: number;

    it('POST /api/v1/orders/checkout converts cart into pending order and reduces stock', async () => {
      // Check current stock
      const prodRes = await client.get(`/api/v1/products/${targetProductId}`);
      const prodJson = await prodRes.json();
      initialStock = prodJson.stock;

      // Checkout
      const checkoutRes = await client.post('/api/v1/orders/checkout', {
        headers: { Authorization: `Bearer ${customerToken}` },
        body: {
          shippingAddress: {
            fullName: 'Demo Customer',
            addressLine1: '742 Evergreen Terrace',
            city: 'Springfield',
            state: 'OR',
            postalCode: '97477',
            country: 'USA',
          },
        },
      });

      expect(checkoutRes.status).toBe(201);
      const orderJson = await checkoutRes.json();
      expect(orderJson.id).toBeDefined();
      expect(orderJson.status).toBe('pending');
      expect(orderJson.totalAmount).toBeGreaterThan(0);
      expect(orderJson.shippingAddress.city).toBe('Springfield');

      createdOrderId = orderJson.id;

      // Verify cart is now empty
      const cartRes = await client.get('/api/v1/cart', {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      const cartJson = await cartRes.json();
      expect(cartJson.itemCount).toBe(0);
      expect(cartJson.items.length).toBe(0);

      // Verify product stock was decremented by 1
      const updatedProdRes = await client.get(`/api/v1/products/${targetProductId}`);
      const updatedProdJson = await updatedProdRes.json();
      expect(updatedProdJson.stock).toBe(initialStock - 1);
    });

    it('GET /api/v1/orders lists orders for customer', async () => {
      const res = await client.get('/api/v1/orders', {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.count).toBeGreaterThanOrEqual(1);
      expect(json.items.some((o: any) => o.id === createdOrderId)).toBe(true);
    });
  });

  describe('4. Payment Processing', () => {
    it('POST /api/v1/payments completes payment and transitions order status to paid', async () => {
      const res = await client.post('/api/v1/payments', {
        headers: { Authorization: `Bearer ${customerToken}` },
        body: {
          orderId: createdOrderId,
          method: 'credit_card',
          cardLastFour: '4242',
        },
      });

      expect(res.status).toBe(201);
      const paymentJson = await res.json();
      expect(paymentJson.id).toBeDefined();
      expect(paymentJson.status).toBe('completed');
      expect(paymentJson.transactionRef).toBeDefined();

      // Verify order status is now 'paid'
      const orderRes = await client.get(`/api/v1/orders/${createdOrderId}`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      const orderJson = await orderRes.json();
      expect(orderJson.status).toBe('paid');
      expect(orderJson.paymentId).toBe(paymentJson.id);
    });
  });

  describe('5. Post-Purchase Customer Review', () => {
    it('POST /api/v1/products/:id/reviews submits customer review', async () => {
      const res = await client.post(`/api/v1/products/${targetProductId}/reviews`, {
        headers: { Authorization: `Bearer ${customerToken}` },
        body: {
          rating: 5,
          comment: 'Outstanding product! Fast shipping and top-tier build quality.',
        },
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.id).toBeDefined();
      expect(json.rating).toBe(5);
      expect(json.userName).toBe('Demo Customer');
    });

    it('POST /api/v1/products/:id/reviews rejects duplicate review from same user', async () => {
      const res = await client.post(`/api/v1/products/${targetProductId}/reviews`, {
        headers: { Authorization: `Bearer ${customerToken}` },
        body: {
          rating: 4,
          comment: 'Another review attempt.',
        },
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.message).toContain('already submitted a review');
    });
  });

  describe('6. Admin Order Fulfillment & RBAC Enforcement', () => {
    it('PATCH /api/v1/orders/:id/status updates status to shipped by admin', async () => {
      const res = await client.patch(`/api/v1/orders/${createdOrderId}/status`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          status: 'shipped',
        },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('shipped');
    });

    it('Customer cannot cancel already shipped order', async () => {
      const res = await client.post(`/api/v1/orders/${createdOrderId}/cancel`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.message).toContain('cannot be cancelled');
    });
  });
});
