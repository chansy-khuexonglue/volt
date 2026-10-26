import { describe, expect, it } from 'bun:test';
import { Volt } from '@voltts/core';
import { postgresPlugin, PostgresClient } from '../src/index';

describe('@voltts/plugin-postgres', () => {
  it('decorates Volt application with db client', async () => {
    const app = new Volt();
    app.use(postgresPlugin());

    const db: PostgresClient = app.store.db;
    expect(db).toBeDefined();

    const res = await db.query('SELECT 1');
    expect(res.rowCount).toBe(1);
  });

  it('supports transactions', async () => {
    const app = new Volt();
    app.use(postgresPlugin());

    const db: PostgresClient = app.store.db;
    const result = await db.transaction(async (tx) => {
      const q = await tx.query('SELECT 1');
      return q.rowCount;
    });

    expect(result).toBe(1);
  });

  it('calls cleanup on app stop', async () => {
    let closed = false;
    const mockClient = {
      query: async () => ({ rows: [], rowCount: 0 }),
      transaction: async (cb: any) => cb(this),
      end: async () => {
        closed = true;
      },
    };

    const app = new Volt();
    app.use(postgresPlugin({ client: mockClient as any }));
    await app.stop();
    expect(closed).toBe(true);
  });
});
