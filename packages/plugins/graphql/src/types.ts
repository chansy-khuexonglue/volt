import { GraphQLSchema } from 'graphql';
import { VoltContext } from '@volt/core';

export interface GraphQLResolverMap {
  Query?: Record<string, (args: any, context: any, info: any) => any>;
  Mutation?: Record<string, (args: any, context: any, info: any) => any>;
  Subscription?: Record<string, any>;
  [type: string]: any;
}

export interface GraphiQLOptions {
  enabled?: boolean;
  title?: string;
  defaultQuery?: string;
  headers?: Record<string, string>;
}

export interface GraphQLOptions {
  /**
   * Endpoint path for GraphQL queries (default: '/graphql')
   */
  path?: string;

  /**
   * Pre-constructed GraphQLSchema object
   */
  schema?: GraphQLSchema;

  /**
   * GraphQL Schema Definition Language (SDL) string
   */
  typeDefs?: string;

  /**
   * Resolvers map matching the schema
   */
  resolvers?: GraphQLResolverMap;

  /**
   * Root value passed to root resolvers
   */
  rootValue?: any;

  /**
   * Function to construct GraphQL context from VoltContext
   */
  context?: (c: VoltContext) => any | Promise<any>;

  /**
   * Whether to enable the interactive GraphiQL explorer (default: true in dev)
   */
  graphiql?: boolean | GraphiQLOptions;

  /**
   * Optional custom error formatter
   */
  formatError?: (error: any) => any;
}

export interface GraphQLRequestBody {
  query?: string;
  operationName?: string;
  variables?: Record<string, any> | null;
}
