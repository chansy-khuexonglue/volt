import { MiddlewareHandler, SecureHeadersOptions } from './types';

export function secureHeaders(options: SecureHeadersOptions = {}): MiddlewareHandler {
  const csp = options.contentSecurityPolicy !== undefined
    ? options.contentSecurityPolicy
    : "default-src 'self'";

  const xFrame = options.xFrameOptions !== undefined ? options.xFrameOptions : 'DENY';
  const xContentType = options.xContentTypeOptions !== false;
  const hsts = options.strictTransportSecurity !== undefined
    ? options.strictTransportSecurity
    : 'max-age=31536000; includeSubDomains';
  const referrer = options.referrerPolicy !== undefined
    ? options.referrerPolicy
    : 'no-referrer';

  return async (ctx: any, next) => {
    const res = await next();
    const response = res instanceof Response ? res : new Response(null, { status: 204 });

    if (csp && !response.headers.has('Content-Security-Policy')) {
      response.headers.set('Content-Security-Policy', csp);
    }
    if (xFrame) response.headers.set('X-Frame-Options', xFrame);
    if (xContentType) response.headers.set('X-Content-Type-Options', 'nosniff');
    if (hsts) response.headers.set('Strict-Transport-Security', hsts);
    if (referrer) response.headers.set('Referrer-Policy', referrer);
    if (options.xXssProtection !== false) response.headers.set('X-XSS-Protection', '0');

    return response;
  };
}
