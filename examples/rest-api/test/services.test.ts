import { describe, expect, it } from 'bun:test';
import { authService } from '../src/modules/auth/auth.service';
import { productsService } from '../src/modules/products/products.service';

describe('AuthService', () => {
  it('registers a new user and hashes password', async () => {
    const result = await authService.register({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'securepass123',
      role: 'user',
    });

    expect(result.user.id).toBeDefined();
    expect(result.user.email).toBe('jane@example.com');
    expect(result.user.name).toBe('Jane Doe');
    expect(result.user.role).toBe('user');
    expect(result.token).toBeDefined();
    expect((result.user as any).passwordHash).toBeUndefined();
  });

  it('rejects registering an existing email', async () => {
    expect(
      authService.register({
        name: 'Jane Clone',
        email: 'jane@example.com',
        password: 'anotherpassword',
        role: 'user',
      })
    ).rejects.toThrow('Email address already registered');
  });

  it('authenticates valid credentials and issues a JWT token', async () => {
    const auth = await authService.login('admin@volt.sh', 'admin123');

    expect(auth.user.email).toBe('admin@volt.sh');
    expect(auth.user.role).toBe('admin');
    expect(auth.token).toBeDefined();
    expect(typeof auth.token).toBe('string');
  });

  it('rejects login with wrong password', async () => {
    expect(authService.login('admin@volt.sh', 'wrong-password')).rejects.toThrow(
      'Invalid email or password'
    );
  });

  it('rejects login with non-existent email', async () => {
    expect(authService.login('nobody@volt.sh', 'randompass')).rejects.toThrow(
      'Invalid email or password'
    );
  });

  it('verifies valid token and returns payload', async () => {
    const { token } = (await authService.login('admin@volt.sh', 'admin123'))!;
    const payload = await authService.verifyToken(token);

    expect(payload).toBeDefined();
    expect(payload?.email).toBe('admin@volt.sh');
    expect(payload?.role).toBe('admin');
  });

  it('returns null on invalid token verification', async () => {
    const payload = await authService.verifyToken('invalid.jwt.token');
    expect(payload).toBeNull();
  });
});

describe('ProductsService', () => {
  it('returns seeded products list', () => {
    const products = productsService.findAll();
    expect(products.length).toBeGreaterThanOrEqual(3);
  });

  it('filters products by category', () => {
    const electronics = productsService.findAll({ category: 'Electronics' });
    expect(electronics.length).toBeGreaterThanOrEqual(1);
    expect(electronics.every((p) => p.category === 'Electronics')).toBe(true);
  });

  it('filters products by minPrice and maxPrice', () => {
    const filtered = productsService.findAll({ minPrice: 200, maxPrice: 800 });
    expect(filtered.length).toBeGreaterThanOrEqual(1);
    expect(filtered.every((p) => p.price >= 200 && p.price <= 800)).toBe(true);
  });

  it('finds product by id', () => {
    const product = productsService.findById('prod_1');
    expect(product).toBeDefined();
    expect(product?.name).toContain('Keychron');
  });

  it('returns undefined for non-existent product id', () => {
    const product = productsService.findById('prod_non_existent');
    expect(product).toBeUndefined();
  });

  it('creates, updates and deletes a product', () => {
    const created = productsService.create({
      name: 'Wireless Ergonomic Mouse',
      description: 'Precision ergonomic wireless mouse with silent clicks',
      price: 59.99,
      stock: 50,
      category: 'Electronics',
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Wireless Ergonomic Mouse');
    expect(created.price).toBe(59.99);

    const updated = productsService.update(created.id, {
      price: 49.99,
      stock: 40,
    });

    expect(updated).toBeDefined();
    expect(updated?.price).toBe(49.99);
    expect(updated?.stock).toBe(40);

    const deleted = productsService.delete(created.id);
    expect(deleted).toBe(true);
    expect(productsService.findById(created.id)).toBeUndefined();
  });
});
