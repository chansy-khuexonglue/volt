import { MiddlewareHandler } from '@voltts/middleware';
import { ExtractParams, Handler, RouteSchemaConfig } from './types';

export class RouteGroup {
  public prefix: string;
  public middlewares: MiddlewareHandler[] = [];
  public routes: Array<{
    method: string;
    path: string;
    handler: Handler<any, any, any, any>;
    schema?: RouteSchemaConfig;
    middlewares: MiddlewareHandler[];
  }> = [];

  constructor(prefix = '', parentMiddlewares: MiddlewareHandler[] = []) {
    this.prefix = prefix.startsWith('/') ? prefix : '/' + prefix;
    if (this.prefix.endsWith('/') && this.prefix.length > 1) {
      this.prefix = this.prefix.slice(0, -1);
    }
    this.middlewares = [...parentMiddlewares];
  }

  use(middleware: MiddlewareHandler): this {
    this.middlewares.push(middleware);
    return this;
  }

  private join(path: string): string {
    if (!path || path === '/') {
      return this.prefix || '/';
    }
    const p = path.startsWith('/') ? path : '/' + path;
    const full = this.prefix + p;
    return full === '' ? '/' : full;
  }

  add<TPath extends string = string>(
    method: string,
    path: TPath,
    handler: Handler<ExtractParams<TPath>>,
    schema?: RouteSchemaConfig,
    routeMiddlewares: MiddlewareHandler[] = []
  ): this {
    this.routes.push({
      method: method.toUpperCase(),
      path: this.join(path),
      handler,
      schema,
      middlewares: [...this.middlewares, ...routeMiddlewares],
    });
    return this;
  }

  get<TPath extends string = string>(
    path: TPath,
    handler: Handler<ExtractParams<TPath>>,
    schema?: RouteSchemaConfig,
    routeMiddlewares: MiddlewareHandler[] = []
  ): this {
    return this.add('GET', path, handler, schema, routeMiddlewares);
  }

  post<TPath extends string = string>(
    path: TPath,
    handler: Handler<ExtractParams<TPath>>,
    schema?: RouteSchemaConfig,
    routeMiddlewares: MiddlewareHandler[] = []
  ): this {
    return this.add('POST', path, handler, schema, routeMiddlewares);
  }

  put<TPath extends string = string>(
    path: TPath,
    handler: Handler<ExtractParams<TPath>>,
    schema?: RouteSchemaConfig,
    routeMiddlewares: MiddlewareHandler[] = []
  ): this {
    return this.add('PUT', path, handler, schema, routeMiddlewares);
  }

  delete<TPath extends string = string>(
    path: TPath,
    handler: Handler<ExtractParams<TPath>>,
    schema?: RouteSchemaConfig,
    routeMiddlewares: MiddlewareHandler[] = []
  ): this {
    return this.add('DELETE', path, handler, schema, routeMiddlewares);
  }

  patch<TPath extends string = string>(
    path: TPath,
    handler: Handler<ExtractParams<TPath>>,
    schema?: RouteSchemaConfig,
    routeMiddlewares: MiddlewareHandler[] = []
  ): this {
    return this.add('PATCH', path, handler, schema, routeMiddlewares);
  }

  group(prefix: string, fn: (group: RouteGroup) => void): this {
    const subGroup = new RouteGroup(this.join(prefix), this.middlewares);
    fn(subGroup);
    this.routes.push(...subGroup.routes);
    return this;
  }
}
