export type JwtAlgorithm = 'HS256' | 'HS384' | 'HS512';

export interface JwtHeader {
  alg: JwtAlgorithm;
  typ?: string;
  [key: string]: unknown;
}

export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

export interface SignOptions {
  algorithm?: JwtAlgorithm;
  expiresIn?: number | string; // seconds or format like '1h', '7d', '15m'
  issuer?: string;
  audience?: string | string[];
  subject?: string;
}

export interface VerifyOptions {
  algorithms?: JwtAlgorithm[];
  issuer?: string;
  audience?: string | string[];
  maxAge?: number;
  clockTolerance?: number; // seconds
}

export interface JwtMiddlewareOptions extends VerifyOptions {
  secret: string;
  algorithm?: JwtAlgorithm;
  header?: string; // defaults to 'authorization'
  cookie?: string; // optional cookie name
  paramName?: string; // defaults to 'user' in ctx.store
  optional?: boolean; // if true, won't return 401 on missing token
}
