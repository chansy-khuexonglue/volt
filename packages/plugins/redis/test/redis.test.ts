import { describe, expect, it } from 'bun:test';
import { Volt } from '@volt/core';
import { redisPlugin } from '../src/index';

describe('@volt/plugin-redis', () => {
  it('decorates Volt application with redis client', async () => {
    const app = new Volt();
    app.use(redisPlugin());

    const redis = app.store.redis;
    expect(redis).toBeDefined();

    await redis.set('counter', '42');
    expect(await redis.get('counter')).toBe('42');
    expect(await redis.has('counter')).toBe(true);

    await redis.del('counter');
    expect(await redis.has('counter')).toBe(false);
  });

  it('runs cleanup hook on app stop', async () => {
    const app = new Volt();
    let closed = false;
    const mockClient = {
      get: async () => null,
      set: async () => {},
      del: async () => true,
      has: async () => false,
      close: async () => {
        closed = true;
      },
    };

    app.use(redisPlugin({ client: mockClient }));
    await app.stop();
    expect(closed).toBe(true);
  });
});
