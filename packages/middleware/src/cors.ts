import { CorsOptions, MiddlewareHandler } from './types';

export function cors(options: CorsOptions = {}): MiddlewareHandler {
  const configuredMethods = (options.methods || ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS']).join(', ');
  const defaultHeaders = ['Content-Type', 'Authorization', 'Accept', 'x-session-id', 'x-cart-id', 'x-requested-with'];
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

    // According to CORS spec, if credentials are true, wildcard '*' is forbidden by browsers.
    // In that case, reflect the incoming Origin.
    if (options.credentials && (allowOrigin === '*' || !allowOrigin) && origin) {
      allowOrigin = origin;
    }

    const reqHeaders = ctx.req.headers.get('access-control-request-headers');
    const allowedHeaders = options.allowedHeaders
      ? options.allowedHeaders.join(', ')
      : reqHeaders
      ? reqHeaders
      : defaultHeaders.join(', ');

    // Handle preflight OPTIONS request
    if (ctx.req.method === 'OPTIONS') {
      const headers = new Headers();
      if (allowOrigin) {
        headers.set('Access-Control-Allow-Origin', allowOrigin);
        if (allowOrigin !== '*') {
          headers.set('Vary', 'Origin');
        }
      }
      if (options.credentials) headers.set('Access-Control-Allow-Credentials', 'true');
      headers.set('Access-Control-Allow-Methods', configuredMethods);
      headers.set('Access-Control-Allow-Headers', allowedHeaders);
      headers.set('Access-Control-Max-Age', maxAge);
      if (exposedHeaders) headers.set('Access-Control-Expose-Headers', exposedHeaders);

      return new Response(null, { status: 204, headers });
    }

    const res = await next();
    const response = res instanceof Response ? res : new Response(null, { status: 204 });

    if (allowOrigin) {
      response.headers.set('Access-Control-Allow-Origin', allowOrigin);
      if (allowOrigin !== '*') {
        response.headers.set('Vary', 'Origin');
      }
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
