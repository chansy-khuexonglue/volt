import { describe, expect, it } from 'bun:test';
import { Volt } from '@volt/core';
import { jwtPlugin } from '../src/index';

describe('@volt/plugin-jwt', () => {
  const secret = 'super-secret-volt-plugin-key-1234567890';

  it('decorates Volt application with sign and verify helpers', async () => {
    const app = new Volt();
    app.use(jwtPlugin({ secret }));

    const jwtHelper = app.store.jwt;
    expect(jwtHelper).toBeDefined();

    const token = await jwtHelper.sign({ userId: 'u_99' });
    const verified = await jwtHelper.verify(token);
    expect(verified.userId).toBe('u_99');
  });

  it('protects routes globally when protectAll is true', async () => {
    const app = new Volt();
    app.use(jwtPlugin({ secret, protectAll: true }));

    app.get('/private', () => ({ secret: 'top-secret' }));

    const resUnauth = await app.handle(new Request('http://localhost/private'));
    expect(resUnauth.status).toBe(401);

    const validToken = await app.store.jwt.sign({ role: 'admin' });
    const resAuth = await app.handle(
      new Request('http://localhost/private', {
        headers: { Authorization: `Bearer ${validToken}` },
      })
    );
    expect(resAuth.status).toBe(200);
  });
});
