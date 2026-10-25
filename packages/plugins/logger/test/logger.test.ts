import { describe, expect, it } from 'bun:test';
import { Volt } from '@volt/core';
import { loggerPlugin } from '../src/index';

describe('@volt/plugin-logger', () => {
  it('decorates Volt application with logger instance', () => {
    const app = new Volt();
    app.use(loggerPlugin());

    const logger = app.store.logger;
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('logs incoming requests without throwing', async () => {
    const app = new Volt();
    app.use(loggerPlugin({ format: 'json' }));

    app.get('/logged', () => ({ ok: true }));

    const res = await app.handle(new Request('http://localhost/logged'));
    expect(res.status).toBe(200);
  });
});
