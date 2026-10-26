import { describe, expect, it } from 'bun:test';
import { decode, jwt, sign, verify } from '../src/index';

describe('@voltts/jwt', () => {
  const secret = 'super-secret-volt-key-1234567890123456';

  it('signs and verifies a valid JWT payload using HS256', async () => {
    const payload = { userId: '123', role: 'admin' };
    const token = await sign(payload, secret, { expiresIn: '1h' });

    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);

    const verified = await verify(token, secret);
    expect(verified.userId).toBe('123');
    expect(verified.role).toBe('admin');
    expect(verified.exp).toBeDefined();
    expect(verified.iat).toBeDefined();
  });

  it('signs and verifies with HS384 and HS512', async () => {
    const token384 = await sign({ test: 384 }, secret, { algorithm: 'HS384' });
    const verified384 = await verify(token384, secret, { algorithms: ['HS384'] });
    expect(verified384.test).toBe(384);

    const token512 = await sign({ test: 512 }, secret, { algorithm: 'HS512' });
    const verified512 = await verify(token512, secret, { algorithms: ['HS512'] });
    expect(verified512.test).toBe(512);
  });

  it('fails verification on tampered payload or secret mismatch', async () => {
    const token = await sign({ user: 'alice' }, secret);
    const parts = token.split('.');
    const tamperedToken = `${parts[0]}.${btoa('{"user":"eve"}')}.${parts[2]}`;

    expect(verify(tamperedToken, secret)).rejects.toThrow();
    expect(verify(token, 'wrong-secret')).rejects.toThrow();
  });

  it('enforces expiration (exp)', async () => {
    const expiredToken = await sign({ user: 'expired' }, secret, { expiresIn: -10 });
    expect(verify(expiredToken, secret)).rejects.toThrow(/expired/);
  });

  it('enforces issuer and audience verification', async () => {
    const token = await sign({ user: 'bob' }, secret, {
      issuer: 'volt-auth',
      audience: 'volt-api',
    });

    const valid = await verify(token, secret, {
      issuer: 'volt-auth',
      audience: 'volt-api',
    });
    expect(valid.user).toBe('bob');

    expect(verify(token, secret, { issuer: 'fake-issuer' })).rejects.toThrow(/Invalid issuer/);
    expect(verify(token, secret, { audience: 'fake-audience' })).rejects.toThrow(/Invalid audience/);
  });

  it('decodes header and payload without verifying signature', async () => {
    const token = await sign({ foo: 'bar' }, secret);
    const { header, payload } = decode(token);
    expect(header.alg).toBe('HS256');
    expect(payload.foo).toBe('bar');
  });

  it('works as a Volt middleware', async () => {
    const mw = jwt({ secret });
    const validToken = await sign({ id: 'user_42', role: 'member' }, secret);

    let nextCalled = false;
    const mockCtx: any = {
      req: new Request('http://localhost/protected', {
        headers: { Authorization: `Bearer ${validToken}` },
      }),
      store: {},
      json: (data: any, status: number) => new Response(JSON.stringify(data), { status }),
    };

    await mw(mockCtx, async () => {
      nextCalled = true;
      return new Response('ok');
    });

    expect(nextCalled).toBe(true);
    expect(mockCtx.store.user.id).toBe('user_42');
    expect(mockCtx.store.user.role).toBe('member');
  });

  it('returns 401 on missing or invalid token in middleware', async () => {
    const mw = jwt({ secret });
    const mockCtxMissing: any = {
      req: new Request('http://localhost/protected'),
      store: {},
      json: (data: any, status: number) => new Response(JSON.stringify(data), { status }),
    };

    const res = (await mw(mockCtxMissing, async () => new Response('ok')))! as Response;
    expect(res.status).toBe(401);
  });
});
