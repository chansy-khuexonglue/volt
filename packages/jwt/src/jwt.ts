import { MiddlewareHandler } from '@voltts/middleware';
import {
  JwtAlgorithm,
  JwtHeader,
  JwtMiddlewareOptions,
  JwtPayload,
  SignOptions,
  VerifyOptions,
} from './types';

function parseDuration(duration: number | string): number {
  if (typeof duration === 'number') return duration;
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    const num = Number(duration);
    if (!isNaN(num)) return num;
    throw new Error(`Invalid duration format: "${duration}". Expected format like "60s", "15m", "24h", "7d"`);
  }
  const value = parseInt(match[1]!, 10);
  const unit = match[2];
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return value;
  }
}

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array;
  if (typeof buffer === 'string') {
    bytes = new TextEncoder().encode(buffer);
  } else if (buffer instanceof Uint8Array) {
    bytes = buffer;
  } else {
    bytes = new Uint8Array(buffer);
  }

  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function getSubtleAlg(alg: JwtAlgorithm): HmacKeyGenParams {
  switch (alg) {
    case 'HS256': return { name: 'HMAC', hash: 'SHA-256' };
    case 'HS384': return { name: 'HMAC', hash: 'SHA-384' };
    case 'HS512': return { name: 'HMAC', hash: 'SHA-512' };
    default: throw new Error(`Unsupported JWT algorithm: ${alg}`);
  }
}

async function getKey(secret: string, alg: JwtAlgorithm, usage: KeyUsage): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    getSubtleAlg(alg),
    false,
    [usage]
  );
}

export async function sign(
  payload: JwtPayload,
  secret: string,
  options: SignOptions = {}
): Promise<string> {
  const alg = options.algorithm || 'HS256';
  const header: JwtHeader = { alg, typ: 'JWT' };

  const now = Math.floor(Date.now() / 1000);
  const finalPayload: JwtPayload = { ...payload };

  if (!finalPayload.iat) {
    finalPayload.iat = now;
  }

  if (options.expiresIn !== undefined) {
    finalPayload.exp = now + parseDuration(options.expiresIn);
  }
  if (options.issuer) finalPayload.iss = options.issuer;
  if (options.audience) finalPayload.aud = options.audience;
  if (options.subject) finalPayload.sub = options.subject;

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(finalPayload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const key = await getKey(secret, alg, 'sign');
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(data)
  );

  const encodedSignature = base64UrlEncode(signatureBuffer);
  return `${data}.${encodedSignature}`;
}

export function decode<T = JwtPayload>(token: string): { header: JwtHeader; payload: T } {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT structure');
  }
  const header = JSON.parse(base64UrlDecode(parts[0]!)) as JwtHeader;
  const payload = JSON.parse(base64UrlDecode(parts[1]!)) as T;
  return { header, payload };
}

export async function verify<T = JwtPayload>(
  token: string,
  secret: string,
  options: VerifyOptions = {}
): Promise<T> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token structure');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = JSON.parse(base64UrlDecode(encodedHeader!)) as JwtHeader;
  const alg = header.alg;

  if (options.algorithms && !options.algorithms.includes(alg)) {
    throw new Error(`Algorithm ${alg} is not allowed by configuration`);
  }

  const key = await getKey(secret, alg, 'verify');
  const data = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
  
  // Convert signature from base64url to Uint8Array
  let sigBase64 = encodedSignature!.replace(/-/g, '+').replace(/_/g, '/');
  while (sigBase64.length % 4 !== 0) sigBase64 += '=';
  const binarySig = atob(sigBase64);
  const sigBytes = new Uint8Array(binarySig.length);
  for (let i = 0; i < binarySig.length; i++) {
    sigBytes[i] = binarySig.charCodeAt(i);
  }

  const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, data);
  if (!isValid) {
    throw new Error('Invalid JWT signature');
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload!)) as JwtPayload;
  const now = Math.floor(Date.now() / 1000);
  const tolerance = options.clockTolerance || 0;

  if (payload.exp !== undefined && now > payload.exp + tolerance) {
    throw new Error('JWT token has expired');
  }

  if (payload.nbf !== undefined && now < payload.nbf - tolerance) {
    throw new Error('JWT token is not active yet');
  }

  if (options.issuer && payload.iss !== options.issuer) {
    throw new Error(`Invalid issuer. Expected: ${options.issuer}, got: ${payload.iss}`);
  }

  if (options.audience) {
    const audArray = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    const expectedAudArray = Array.isArray(options.audience) ? options.audience : [options.audience];
    const hasAudience = expectedAudArray.some((aud) => audArray.includes(aud));
    if (!hasAudience) {
      throw new Error(`Invalid audience`);
    }
  }

  return payload as T;
}

export function jwt(options: JwtMiddlewareOptions): MiddlewareHandler {
  const headerName = (options.header || 'authorization').toLowerCase();
  const paramName = options.paramName || 'user';

  return async (c, next) => {
    let token: string | undefined;

    const authHeader = c.req.headers.get(headerName);
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (options.cookie) {
      const cookieHeader = c.req.headers.get('cookie') || '';
      const cookies = Object.fromEntries(
        cookieHeader.split(';').map((v: string) => {
          const [key, ...vals] = v.trim().split('=');
          return [key, vals.join('=')];
        })
      );
      token = cookies[options.cookie];
    }

    if (!token) {
      if (options.optional) {
        return next();
      }
      return c.json({ error: 'Unauthorized', message: 'Missing authentication token' }, 401);
    }

    try {
      const payload = await verify(token, options.secret, options);
      c.store[paramName] = payload;
      return next();
    } catch (err: any) {
      if (options.optional) {
        return next();
      }
      return c.json({ error: 'Unauthorized', message: err.message || 'Invalid token' }, 401);
    }
  };
}
