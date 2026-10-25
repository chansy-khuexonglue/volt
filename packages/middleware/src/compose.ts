import { MiddlewareHandler, NextFunction } from './types';

/**
 * Precomposes an array of middleware functions into a single execution function.
 * Optimized for minimal Promise and closure allocation.
 */
export function compose<C = any>(middlewares: MiddlewareHandler<C>[]): (ctx: C, finalHandler?: () => Promise<Response> | Response) => Promise<Response> | Response {
  if (middlewares.length === 0) {
    return (ctx: C, finalHandler?: () => Promise<Response> | Response) => {
      if (finalHandler) return finalHandler();
      return new Response('Not Found', { status: 404 });
    };
  }

  if (middlewares.length === 1) {
    const single = middlewares[0]!;
    return (ctx: C, finalHandler?: () => Promise<Response> | Response) => {
      const next: NextFunction = () => {
        if (finalHandler) return finalHandler();
        return;
      };
      const res = single(ctx, next);
      if (res instanceof Promise) {
        return res.then(val => (val instanceof Response ? val : (finalHandler ? finalHandler() : new Response(null, { status: 204 }))));
      }
      if (res instanceof Response) return res;
      if (finalHandler) return finalHandler();
      return new Response(null, { status: 204 });
    };
  }

  return function composedPipeline(ctx: C, finalHandler?: () => Promise<Response> | Response): Promise<Response> | Response {
    let index = -1;

    function dispatch(i: number): Promise<Response> {
      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'));
      }
      index = i;

      if (i === middlewares.length) {
        if (finalHandler) {
          const res = finalHandler();
          return Promise.resolve(res);
        }
        return Promise.resolve(new Response('Not Found', { status: 404 }));
      }

      const fn = middlewares[i]!;

      try {
        const next: NextFunction = () => dispatch(i + 1);
        return Promise.resolve(fn(ctx, next)).then((res) => {
          if (res instanceof Response) return res;
          return new Response(null, { status: 204 });
        });
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  };
}
