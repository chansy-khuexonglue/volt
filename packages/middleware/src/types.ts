export type NextFunction = () => Promise<Response | void> | Response | void;

export type MiddlewareHandler<C = any> = (
  ctx: C,
  next: NextFunction
) => Promise<Response | void> | Response | void;

export interface CorsOptions {
  origin?: string | string[] | ((origin: string) => boolean | string);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export interface LoggerOptions {
  log?: (message: string) => void;
  format?: 'short' | 'dev' | 'json';
}

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  statusCode?: number;
  keyGenerator?: (ctx: any) => string;
}

export interface SecureHeadersOptions {
  contentSecurityPolicy?: string | false;
  xFrameOptions?: 'DENY' | 'SAMEORIGIN' | false;
  xContentTypeOptions?: boolean;
  strictTransportSecurity?: string | false;
  referrerPolicy?: string | false;
  xXssProtection?: boolean;
}
