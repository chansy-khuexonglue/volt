import { Volt, VoltPlugin, VoltContext } from '@voltts/core';
import { buildSchema, graphql, GraphQLSchema, ExecutionResult } from 'graphql';
import { GraphQLOptions, GraphQLRequestBody, GraphiQLOptions } from './types';
import { renderGraphiQL } from './ui';

export * from './types';

export interface VoltGraphQLService {
  schema: GraphQLSchema;
  execute(query: string, variables?: Record<string, any>, contextValue?: any): Promise<ExecutionResult>;
}

export function graphqlPlugin(options: GraphQLOptions): VoltPlugin {
  const path = options.path || '/graphql';
  let schema: GraphQLSchema;

  if (options.schema) {
    schema = options.schema;
  } else if (options.typeDefs) {
    schema = buildSchema(options.typeDefs);
  } else {
    throw new Error('[@voltts/plugin-graphql] Either "schema" or "typeDefs" must be provided.');
  }

  // Combine resolvers into rootValue
  const rootValue = {
    ...options.rootValue,
    ...options.resolvers?.Query,
    ...options.resolvers?.Mutation,
  };

  const graphiqlConfig: GraphiQLOptions = typeof options.graphiql === 'object'
    ? options.graphiql
    : { enabled: options.graphiql !== false };

  async function executeGraphQL(
    query: string,
    variables?: Record<string, any> | null,
    operationName?: string,
    context?: any
  ): Promise<ExecutionResult> {
    const result = await graphql({
      schema,
      source: query,
      rootValue,
      contextValue: context,
      variableValues: variables || undefined,
      operationName: operationName || undefined,
    });

    if (result.errors && options.formatError) {
      return {
        ...result,
        errors: result.errors.map(options.formatError),
      };
    }

    return result;
  }

  return {
    name: '@voltts/plugin-graphql',
    version: '0.1.0',
    setup(app: Volt) {
      // Decorate application with GraphQL service
      app.decorate('graphql', {
        schema,
        execute(q: string, vars?: Record<string, any>, ctxVal?: any) {
          return executeGraphQL(q, vars, undefined, ctxVal);
        },
      } satisfies VoltGraphQLService);

      // GET handler: GraphiQL or query execution via query param
      app.get(path, async (c: VoltContext) => {
        const accept = c.req.headers.get('accept') || '';
        const url = new URL(c.req.url);
        const queryParam = url.searchParams.get('query');

        // Render GraphiQL if requested in browser and enabled
        if (graphiqlConfig.enabled && !queryParam && accept.includes('text/html')) {
          const html = renderGraphiQL(path, graphiqlConfig);
          return new Response(html, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com data: blob:;",
            },
          });
        }

        if (!queryParam) {
          return c.json({ error: 'GraphQL query parameter missing' }, 400);
        }

        let variables: Record<string, any> | undefined;
        const variablesParam = url.searchParams.get('variables');
        if (variablesParam) {
          try {
            variables = JSON.parse(variablesParam);
          } catch {
            return c.json({ error: 'Invalid variables JSON parameter' }, 400);
          }
        }

        const operationName = url.searchParams.get('operationName') || undefined;
        const contextValue = options.context ? await options.context(c) : { ctx: c };

        const result = await executeGraphQL(queryParam, variables, operationName, contextValue);
        return c.json(result, result.errors?.length && !result.data ? 400 : 200);
      });

      // POST handler: JSON execution & batch support
      app.post(path, async (c: VoltContext) => {
        let body: GraphQLRequestBody | GraphQLRequestBody[];
        body = (c.body !== undefined && c.body !== null && Object.keys(c.body).length > 0)
          ? c.body
          : await c.req.json().catch(() => null);

        if (!body) {
          return c.json({ error: 'Invalid JSON request body' }, 400);
        }

        const contextValue = options.context ? await options.context(c) : { ctx: c };

        // Support batch queries
        if (Array.isArray(body)) {
          const results = await Promise.all(
            body.map((item) => {
              if (!item.query) {
                return Promise.resolve({ errors: [{ message: 'Missing query in batch item' }] });
              }
              return executeGraphQL(item.query, item.variables, item.operationName, contextValue);
            })
          );
          return c.json(results);
        }

        if (!body.query) {
          return c.json({ error: 'Missing GraphQL query in request body' }, 400);
        }

        const result = await executeGraphQL(body.query, body.variables, body.operationName, contextValue);
        return c.json(result, result.errors?.length && !result.data ? 400 : 200);
      });
    },
  };
}

export default graphqlPlugin;
