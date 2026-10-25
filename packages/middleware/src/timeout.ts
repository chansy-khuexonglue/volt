import { MiddlewareHandler } from './types';

export function timeout(ms: number): MiddlewareHandler {
  return async (ctx: any, next) => {
    let timer: any;

    const timeoutPromise = new Promise<Response>((resolve) => {
      timer = setTimeout(() => {
        resolve(
          new Response(
            JSON.stringify({
              error: 'Gateway Timeout',
              message: `Request exceeded timeout limit of ${ms}ms`,
            }),
            {
              status: 504,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        );
      }, ms);
    });

    try {
      const responsePromise = Promise.resolve(next()).then((res) => {
        clearTimeout(timer);
        return res instanceof Response ? res : new Response(null, { status: 204 });
      });

      return await Promise.race([responsePromise, timeoutPromise]);
    } finally {
      clearTimeout(timer);
    }
  };
}
