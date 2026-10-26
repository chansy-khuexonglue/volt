import { describe, expect, it } from 'bun:test';
import { Volt } from '@voltts/core';
import { graphqlPlugin } from '../src/index';

describe('@voltts/plugin-graphql', () => {
  const typeDefs = `
    type User {
      id: ID!
      name: String!
      role: String!
    }

    type Query {
      hello(name: String): String!
      me: User!
      users: [User!]!
    }

    type Mutation {
      createUser(name: String!, role: String): User!
    }
  `;

  const users = [
    { id: '1', name: 'Alice', role: 'admin' },
    { id: '2', name: 'Bob', role: 'user' },
  ];

  const resolvers = {
    Query: {
      hello: ({ name }: { name?: string }) => `Hello, ${name || 'World'}!`,
      me: (_args: any, context: any) => context.currentUser,
      users: () => users,
    },
    Mutation: {
      createUser: ({ name, role }: { name: string; role?: string }) => {
        const newUser = { id: String(users.length + 1), name, role: role || 'user' };
        users.push(newUser);
        return newUser;
      },
    },
  };

  it('executes GraphQL query via POST and returns JSON', async () => {
    const app = new Volt();
    app.plugin(
      graphqlPlugin({
        typeDefs,
        resolvers,
        context: () => ({ currentUser: { id: '42', name: 'Admin', role: 'admin' } }),
      })
    );

    const res = await app.handle(
      new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: '{ hello(name: "Volt") }',
        }),
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual({ hello: 'Hello, Volt!' });
  });

  it('injects context into resolvers', async () => {
    const app = new Volt();
    app.plugin(
      graphqlPlugin({
        typeDefs,
        resolvers,
        context: (c) => ({
          currentUser: { id: '99', name: c.req.headers.get('x-user') || 'Guest', role: 'viewer' },
        }),
      })
    );

    const res = await app.handle(
      new Request('http://localhost/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user': 'Chansy',
        },
        body: JSON.stringify({
          query: '{ me { id name role } }',
        }),
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.me).toEqual({ id: '99', name: 'Chansy', role: 'viewer' });
  });

  it('executes mutation via POST', async () => {
    const app = new Volt();
    app.plugin(graphqlPlugin({ typeDefs, resolvers }));

    const res = await app.handle(
      new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'mutation Create($name: String!, $role: String) { createUser(name: $name, role: $role) { id name role } }',
          variables: { name: 'Charlie', role: 'engineer' },
        }),
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.createUser.name).toBe('Charlie');
    expect(body.data.createUser.role).toBe('engineer');
  });

  it('supports query execution via GET query parameter', async () => {
    const app = new Volt();
    app.plugin(graphqlPlugin({ typeDefs, resolvers }));

    const res = await app.handle(
      new Request('http://localhost/graphql?query=%7B%20hello%20%7D')
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.hello).toBe('Hello, World!');
  });

  it('renders GraphiQL HTML on browser GET request', async () => {
    const app = new Volt();
    app.plugin(
      graphqlPlugin({
        typeDefs,
        resolvers,
        graphiql: { enabled: true, title: 'Custom GraphiQL' },
      })
    );

    const res = await app.handle(
      new Request('http://localhost/graphql', {
        method: 'GET',
        headers: { Accept: 'text/html' },
      })
    );

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('Custom GraphiQL');
    expect(html).toContain('GraphiQL');
  });

  it('supports batch queries', async () => {
    const app = new Volt();
    app.plugin(graphqlPlugin({ typeDefs, resolvers }));

    const res = await app.handle(
      new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { query: '{ hello(name: "A") }' },
          { query: '{ hello(name: "B") }' },
        ]),
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(2);
    expect(body[0].data.hello).toBe('Hello, A!');
    expect(body[1].data.hello).toBe('Hello, B!');
  });

  it('decorates application with graphql service', async () => {
    const app = new Volt();
    app.plugin(graphqlPlugin({ typeDefs, resolvers }));

    const graphqlService = (app as any).graphql;
    expect(graphqlService).toBeDefined();

    const res = await graphqlService.execute('{ hello(name: "Internal") }');
    expect(res.data.hello).toBe('Hello, Internal!');
  });
});
