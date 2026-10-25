import { LoggerOptions, MiddlewareHandler } from './types';

export function logger(options: LoggerOptions = {}): MiddlewareHandler {
  const logFn = options.log || console.log;
  const format = options.format || 'dev';

  return async (ctx: any, next) => {
    const start = performance.now();
    const method = ctx.req.method;
    const url = new URL(ctx.req.url).pathname;

    let response: Response | void = undefined;
    let error: any;

    try {
      response = await next();
    } catch (err) {
      error = err;
      throw err;
    } finally {
      const duration = (performance.now() - start).toFixed(2);
      const status = error
        ? (typeof error.status === 'number' ? error.status : 500)
        : (response instanceof Response ? response.status : 200);

      if (format === 'json') {
        logFn(
          JSON.stringify({
            method,
            path: url,
            status,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
          })
        );
      } else {
        logFn(`[Volt] ${method} ${url} -> ${status} (${duration}ms)`);
      }
    }

    return response;
  };
}
