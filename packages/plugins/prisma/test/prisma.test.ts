import { describe, expect, it } from 'bun:test';
import { Volt } from '@volt/core';
import { prismaPlugin, MemoryPrismaClient } from '../src/index';

describe('@volt/plugin-prisma', () => {
  it('decorates Volt application with prisma instance', () => {
    const app = new Volt();
    const client = new MemoryPrismaClient();

    app.plugin(prismaPlugin({ client }));

    expect((app as any).prisma).toBe(client);
    expect(app.store.prisma).toBe(client);
  });

  it('injects prisma client into request context store', async () => {
    const app = new Volt();
    const client = new MemoryPrismaClient();

    app.plugin(prismaPlugin({ client }));

    app.get('/test', (c) => {
      expect(c.store.prisma).toBe(client);
      return c.json({ ok: true });
    });

    const res = await app.handle(new Request('http://localhost/test'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('translates P2002 unique constraint error into 409 Conflict', async () => {
    const app = new Volt();
    app.plugin(prismaPlugin());

    app.post('/users', () => {
      const err: any = new Error('Unique constraint failed');
      err.code = 'P2002';
      err.meta = { target: ['email'] };
      throw err;
    });

    const res = await app.handle(
      new Request('http://localhost/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'duplicate@example.com' }),
      })
    );

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toBe('DatabaseError');
    expect(body.code).toBe('P2002');
    expect(body.message).toContain('email');
  });

  it('translates P2025 record not found error into 404', async () => {
    const app = new Volt();
    app.plugin(prismaPlugin());

    app.get('/users/999', () => {
      const err: any = new Error('Record to delete does not exist.');
      err.code = 'P2025';
      err.meta = { cause: 'User with id 999 not found' };
      throw err;
    });

    const res = await app.handle(new Request('http://localhost/users/999'));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.code).toBe('P2025');
    expect(body.message).toBe('User with id 999 not found');
  });

  it('calls $disconnect on app stop cleanup', async () => {
    const app = new Volt();
    const client = new MemoryPrismaClient();
    await client.$connect();
    expect(client.isConnected()).toBe(true);

    app.plugin(prismaPlugin({ client }));
    await app.stop();

    expect(client.isConnected()).toBe(false);
  });
});
