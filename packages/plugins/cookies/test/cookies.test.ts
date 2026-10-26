import { describe, expect, it } from 'bun:test';
import { Volt } from '@voltts/core';
import { cookiesPlugin, signCookie, unsignCookie } from '../src/index';

describe('@voltts/plugin-cookies', () => {
  const secret = 'super-secret-cookie-signing-key-32-chars';

  it('signs and verifies signed cookies correctly', () => {
    const signed = signCookie('session_123', secret);
    expect(signed.startsWith('s:session_123.')).toBe(true);

    const verified = unsignCookie(signed, secret);
    expect(verified).toBe('session_123');

    const tampered = signed.slice(0, -3) + 'abc';
    expect(unsignCookie(tampered, secret)).toBe(false);

    expect(unsignCookie(signed, 'wrong-secret')).toBe(false);
  });

  it('sets and gets regular and signed cookies via context helper', async () => {
    const app = new Volt();
    app.plugin(cookiesPlugin({ secret, defaults: { httpOnly: true, secure: true } }));

    app.get('/login', (c) => {
      c.store.cookies.setSigned('sessionId', 'sess_abc123', { maxAge: 3600 });
      return c.json({ loggedIn: true });
    });

    const res = await app.handle(new Request('http://localhost/login'));
    expect(res.status).toBe(200);

    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain('sessionId=s%3Asess_abc123.');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('Secure');
  });

  it('reads and verifies incoming signed cookie', async () => {
    const app = new Volt();
    app.plugin(cookiesPlugin({ secret }));

    app.get('/profile', (c) => {
      const sessionId = c.store.cookies.getSigned('sessionId');
      return c.json({ sessionId });
    });

    const signedVal = signCookie('sess_real_user', secret);

    const res = await app.handle(
      new Request('http://localhost/profile', {
        headers: {
          Cookie: `sessionId=${signedVal}`,
        },
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sessionId).toBe('sess_real_user');
  });

  it('rejects tampered cookie when reading signed cookie', async () => {
    const app = new Volt();
    app.plugin(cookiesPlugin({ secret }));

    app.get('/profile', (c) => {
      const sessionId = c.store.cookies.getSigned('sessionId');
      return c.json({ valid: sessionId !== false && sessionId !== undefined, sessionId });
    });

    const res = await app.handle(
      new Request('http://localhost/profile', {
        headers: {
          Cookie: 'sessionId=s:sess_hacked.badsignature123',
        },
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(body.sessionId).toBe(false);
  });

  it('deletes cookie by setting maxAge=0 and expired date', async () => {
    const app = new Volt();
    app.plugin(cookiesPlugin({ secret }));

    app.post('/logout', (c) => {
      c.store.cookies.delete('sessionId');
      return c.json({ loggedOut: true });
    });

    const res = await app.handle(new Request('http://localhost/logout', { method: 'POST' }));
    expect(res.status).toBe(200);
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain('Max-Age=0');
  });
});
