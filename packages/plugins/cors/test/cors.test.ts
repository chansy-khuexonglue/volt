import { describe, expect, it } from 'bun:test';
import { Volt } from '@voltts/core';
import { corsPlugin } from '../src/index';

describe('@voltts/plugin-cors', () => {
  it('registers cors plugin and sets headers on requests', async () => {
    const app = new Volt();
    app.use(corsPlugin({ origin: 'https://volt.sh' }));

    app.get('/test', () => ({ ok: true }));

    const res = await app.handle(new Request('http://localhost/test'));
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://volt.sh');
  });

  it('prevents duplicate registration', () => {
    const app = new Volt();
    app.use(corsPlugin());
    expect(() => app.use(corsPlugin())).toThrow(/already registered/);
  });
});
