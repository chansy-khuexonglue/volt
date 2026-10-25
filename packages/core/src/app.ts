import { compose, MiddlewareHandler } from '@volt/middleware';
import { Router } from '@volt/router';
import { serializeResponse } from '@volt/serializer';
import { compile, ValidationError } from '@volt/validator';
import { VoltContext } from './context';
import { BadRequestError, handleServerException, HttpError, NotFoundError } from './error';
import { RouteGroup } from './group';
import {
  ExtractParams,
  Handler,
  LifecycleHooks,
  ModuleConfig,
  RouteSchemaConfig,
  ServerOptions,
  VoltPlugin,
} from './types';

export interface RouteDefinition {
  method: string;
  path: string;
  handler: Handler<any, any, any, any>;
  schema?: RouteSchemaConfig;
  middlewares: MiddlewareHandler[];
}

declare const Bun: any;

export class Volt {
  private router = new Router<{
    pipeline: (ctx: VoltContext) => Promise<Response> | Response;
    definition: RouteDefinition;
  }>();

  private globalMiddlewares: MiddlewareHandler[] = [];
  private plugins: VoltPlugin[] = [];
  private hooks: LifecycleHooks = {};
  private globalStore: Record<string, any> = {};
  private routes: RouteDefinition[] = [];
  private serverInstance: any = null;
  private wsManager?: any;

  constructor(private serverOptions: ServerOptions = {}) {}

  get store(): Record<string, any> {
    return this.globalStore;
  }

  decorate(key: string, value: any): this {
    this.globalStore[key] = value;
    (this as any)[key] = value;
    return this;
  }

  use(middlewareOrPlugin: MiddlewareHandler | VoltPlugin): this {
    if ('setup' in middlewareOrPlugin && typeof middlewareOrPlugin.setup === 'function') {
      return this.plugin(middlewareOrPlugin);
    }
    this.globalMiddlewares.push(middlewareOrPlugin as MiddlewareHandler);
    return this;
  }

  plugin(plugin: VoltPlugin): this {
    if (this.plugins.some((p) => p.name === plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }
    this.plugins.push(plugin);
    plugin.setup(this);
    return this;
  }

  registerModule(mod: ModuleConfig): this {
    if (mod.imports) {
      for (const imported of mod.imports) {
        this.registerModule(imported);
      }
    }
    if (mod.setup) {
      mod.setup(this);
    }
    return this;
  }

  onStart(fn: () => void | Promise<void>): this {
    this.hooks.onStart = fn;
    return this;
  }

  onStop(fn: () => void | Promise<void>): this {
    this.hooks.onStop = fn;
    return this;
  }

  onError(fn: (error: Error, req: Request) => Response | Promise<Response>): this {
    this.hooks.onError = fn;
    return this;
  }

  add<TPath extends string = string>(
    method: string,
    path: TPath,
    handler: Handler<ExtractParams<TPath>>,
    schema?: RouteSchemaConfig,
    routeMiddlewares: MiddlewareHandler[] = []
  ): this {
    const definition: RouteDefinition = {
      method: method.toUpperCase(),
      path,
      handler,
      schema,
      middlewares: [...this.globalMiddlewares, ...routeMiddlewares],
    };

    this.routes.push(definition);
    this.compileRoute(definition);
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

  head<TPath extends string = string>(
    path: TPath,
    handler: Handler<ExtractParams<TPath>>,
    schema?: RouteSchemaConfig,
    routeMiddlewares: MiddlewareHandler[] = []
  ): this {
    return this.add('HEAD', path, handler, schema, routeMiddlewares);
  }

  options<TPath extends string = string>(
    path: TPath,
    handler: Handler<ExtractParams<TPath>>,
    schema?: RouteSchemaConfig,
    routeMiddlewares: MiddlewareHandler[] = []
  ): this {
    return this.add('OPTIONS', path, handler, schema, routeMiddlewares);
  }

  all<TPath extends string = string>(
    path: TPath,
    handler: Handler<ExtractParams<TPath>>,
    schema?: RouteSchemaConfig,
    routeMiddlewares: MiddlewareHandler[] = []
  ): this {
    return this.add('ALL', path, handler, schema, routeMiddlewares);
  }

  group(prefix: string, fn: (group: RouteGroup) => void): this {
    const grp = new RouteGroup(prefix, this.globalMiddlewares);
    fn(grp);
    for (const r of grp.routes) {
      this.add(r.method, r.path, r.handler, r.schema, r.middlewares);
    }
    return this;
  }

  ws(path: string, options: any): this {
    if (!this.wsManager) {
      this.wsManager = {
        register: () => {},
        createBunWebSocketHandler: () => ({}),
      };
    }
    this.wsManager.register(path, options);

    // Register upgrade route
    this.get(path, (ctx) => {
      const server = this.serverInstance;
      if (server && typeof server.upgrade === 'function') {
        const upgraded = server.upgrade(ctx.req, {
          data: { path, store: ctx.store },
        });
        if (upgraded) return new Response(null);
      }
      return new Response('WebSocket upgrade failed', { status: 400 });
    });

    return this;
  }

  /**
   * Precompiles route middleware and validation pipelines into single executable functions at startup.
   */
  private compileRoute(def: RouteDefinition): void {
    const bodyValidator = def.schema?.body ? compile(def.schema.body) : null;
    const queryValidator = def.schema?.query ? compile(def.schema.query, { coerce: true }) : null;
    const paramsValidator = def.schema?.params ? compile(def.schema.params, { coerce: true }) : null;
    const headersValidator = def.schema?.headers ? compile(def.schema.headers) : null;

    const baseHandler = async (ctx: VoltContext): Promise<Response> => {
      // 1. Validate route params if schema provided
      if (paramsValidator) {
        const res = paramsValidator(ctx.params);
        if (!res.success) {
          throw new BadRequestError('Invalid route parameters', res.errors);
        }
        if (res.data) {
          Object.assign(ctx.params, res.data);
        }
      }

      // 2. Validate query params if schema provided
      if (queryValidator) {
        const res = queryValidator(ctx.query);
        if (!res.success) {
          throw new BadRequestError('Invalid query parameters', res.errors);
        }
        if (res.data) {
          Object.assign(ctx.query, res.data);
        }
      }

      // 3. Validate body if schema provided or method has body
      if (['POST', 'PUT', 'PATCH'].includes(def.method)) {
        await ctx.parseBody(this.serverOptions.maxRequestBodySize);
        if (bodyValidator) {
          const res = bodyValidator(ctx.body);
          if (!res.success) {
            throw new BadRequestError('Invalid request body', res.errors);
          }
        }
      }

      // 4. Validate headers if schema provided
      if (headersValidator) {
        const headerObj: Record<string, string> = {};
        ctx.req.headers.forEach((v, k) => {
          headerObj[k] = v;
        });
        const res = headersValidator(headerObj);
        if (!res.success) {
          throw new BadRequestError('Invalid request headers', res.errors);
        }
      }

      // Execute route handler
      const result = await def.handler(ctx);
      const response = serializeResponse(result);
      const ctxHeaders = ctx.getResponseHeaders();
      ctxHeaders.forEach((val, key) => {
        response.headers.append(key, val);
      });
      return response;
    };

    const pipeline = compose(def.middlewares);

    this.router.add(def.method, def.path, {
      pipeline: (ctx: VoltContext) => pipeline(ctx, () => baseHandler(ctx)),
      definition: def,
    });
  }

  /**
   * Primary entry point for incoming HTTP requests.
   * Can be invoked directly in-memory for testing without binding ports.
   */
  async handle(req: Request): Promise<Response> {
    try {
      const url = new URL(req.url);
      const match = this.router.match(req.method, url.pathname);

      if (!match) {
        // Check for OPTIONS discovery
        if (req.method === 'OPTIONS') {
          const allowed = this.router.getAllowedMethods(url.pathname);
          if (allowed.length > 0) {
            return new Response(null, {
              status: 204,
              headers: { Allow: allowed.join(', ') },
            });
          }
        }
        throw new NotFoundError(`Cannot ${req.method} ${url.pathname}`);
      }

      const ctx = new VoltContext(req, match.params, { ...this.globalStore });
      const response = await match.handler.pipeline(ctx);

      // Strip body for HEAD requests
      if (req.method === 'HEAD') {
        return new Response(null, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      }

      return response;
    } catch (err: any) {
      if (this.hooks.onError) {
        try {
          return await this.hooks.onError(err, req);
        } catch (hookErr: any) {
          return handleServerException(hookErr, this.serverOptions.development);
        }
      }
      return handleServerException(err, this.serverOptions.development);
    }
  }

  getRegisteredRoutes(): RouteDefinition[] {
    return [...this.routes];
  }

  /**
   * Starts native Bun HTTP server.
   */
  listen(port?: number, callback?: (server: any) => void): any {
    const listenPort = port ?? this.serverOptions.port ?? 3000;
    const hostname = this.serverOptions.hostname ?? '0.0.0.0';

    if (this.hooks.onStart) {
      this.hooks.onStart();
    }

    const bunServeOptions: any = {
      port: listenPort,
      hostname,
      fetch: (req: Request) => this.handle(req),
    };

    if (this.serverOptions.tls) {
      bunServeOptions.tls = this.serverOptions.tls;
    }

    if (this.serverOptions.maxRequestBodySize) {
      bunServeOptions.maxRequestBodySize = this.serverOptions.maxRequestBodySize;
    }

    if (this.wsManager) {
      bunServeOptions.websocket = this.wsManager.createBunWebSocketHandler();
    }

    // Call Bun.serve if in Bun environment
    if (typeof Bun !== 'undefined' && typeof Bun.serve === 'function') {
      this.serverInstance = Bun.serve(bunServeOptions);
      if (callback) callback(this.serverInstance);
      return this.serverInstance;
    }

    // Node.js fallback or mock server
    return {
      port: listenPort,
      hostname,
      stop: () => this.stop(),
    };
  }

  async stop(): Promise<void> {
    if (this.serverInstance && typeof this.serverInstance.stop === 'function') {
      this.serverInstance.stop(true);
    }
    for (const plugin of this.plugins) {
      if (plugin.cleanup) {
        await plugin.cleanup(this);
      }
    }
    if (this.hooks.onStop) {
      await this.hooks.onStop();
    }
  }
}
