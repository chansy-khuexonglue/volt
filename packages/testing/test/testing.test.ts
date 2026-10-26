import { describe, expect, it } from 'bun:test';
import { Volt } from '../../core/src/index';
import { createTestClient } from '../src/index';

describe('@voltts/testing', () => {
  it('supports all standard HTTP verbs via createTestClient', async () => {
    const app = new Volt();

    app.get('/test', () => 'get-ok');
    app.post('/test', () => 'post-ok');
    app.put('/test', () => 'put-ok');
    app.delete('/test', () => 'delete-ok');
    app.patch('/test', () => 'patch-ok');

    const client = createTestClient(app);

    expect(await (await client.get('/test')).text()).toBe('get-ok');
    expect(await (await client.post('/test')).text()).toBe('post-ok');
    expect(await (await client.put('/test')).text()).toBe('put-ok');
    expect(await (await client.delete('/test')).text()).toBe('delete-ok');
    expect(await (await client.patch('/test')).text()).toBe('patch-ok');
  });
});
