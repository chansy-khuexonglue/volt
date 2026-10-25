import { CorsOptions, MiddlewareHandler } from './types';

export function cors(options: CorsOptions = {}): MiddlewareHandler {
  const allowedMethods = (options.methods || ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']).join(', ');
  const allowedHeaders = (options.allowedHeaders || ['Content-Type', 'Authorization', 'Accept']).join(', ');
  const exposedHeaders = options.exposedHeaders ? options.exposedHeaders.join(', ') : '';
  const maxAge = options.maxAge ? String(options.maxAge) : '86400';

  return async (ctx: any, next) => {
    const origin = ctx.req.headers.get('origin');

    let allowOrigin = '*';
    if (typeof options.origin === 'function' && origin) {
      const res = options.origin(origin);
      if (typeof res === 'string') allowOrigin = res;
      else if (res) allowOrigin = origin;
      else allowOrigin = '';
    } else if (Array.isArray(options.origin) && origin) {
      allowOrigin = options.origin.includes(origin) ? origin : '';
    } else if (typeof options.origin === 'string') {
      allowOrigin = options.origin;
    } else if (origin) {
      allowOrigin = origin;
    }

    // Handle preflight OPTIONS request
    if (ctx.req.method === 'OPTIONS') {
      const headers = new Headers();
      if (allowOrigin) headers.set('Access-Control-Allow-Origin', allowOrigin);
      if (options.credentials) headers.set('Access-Control-Allow-Credentials', 'true');
      headers.set('Access-Control-Allow-Methods', allowedMethods);
      headers.set('Access-Control-Allow-Headers', allowedHeaders);
      headers.set('Access-Control-Max-Age', maxAge);
      if (exposedHeaders) headers.set('Access-Control-Expose-Headers', exposedHeaders);

      return new Response(null, { status: 204, headers });
    }

    const res = await next();
    const response = res instanceof Response ? res : new Response(null, { status: 204 });

    if (allowOrigin) {
      response.headers.set('Access-Control-Allow-Origin', allowOrigin);
    }
    if (options.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    if (exposedHeaders) {
      response.headers.set('Access-Control-Expose-Headers', exposedHeaders);
    }

    return response;
  };
}
