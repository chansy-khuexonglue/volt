import { json, text, html } from '@voltts/serializer';

export interface CookieOptions {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: 'strict' | 'lax' | 'none';
  secure?: boolean;
}

export function extractPathname(url: string): string {
  if (url.charCodeAt(0) === 47) {
    const q = url.indexOf('?');
    return q === -1 ? url : url.slice(0, q);
  }
  const s = url.indexOf('/', 7);
  if (s === -1) return '/';
  const q = url.indexOf('?', s + 1);
  return q === -1 ? url.slice(s) : url.slice(s, q);
}

export class VoltContext<
  TParams = Record<string, string>,
  TBody = any,
  TQuery = Record<string, string | string[]>,
  TStore = Record<string, any>
> {
  readonly req: Request;
  readonly params: TParams;
  readonly store: TStore;
  private _url?: URL;
  private _path?: string;
  private _query?: TQuery;
  private _body?: TBody;
  private _responseHeaders?: Headers;
  private _status = 200;

  constructor(req: Request, params: TParams, store: TStore = {} as TStore) {
    this.req = req;
    this.params = params;
    this.store = store;
  }

  get url(): URL {
    if (!this._url) {
      this._url = new URL(this.req.url);
    }
    return this._url;
  }

  get path(): string {
    if (!this._path) {
      this._path = extractPathname(this.req.url);
    }
    return this._path;
  }

  get method(): string {
    return this.req.method;
  }

  get headers(): Headers {
    return this.req.headers;
  }

  get query(): TQuery {
    if (!this._query) {
      const parsed: Record<string, string | string[]> = {};
      for (const [key, val] of this.url.searchParams.entries()) {
        const existing = parsed[key];
        if (existing !== undefined) {
          if (Array.isArray(existing)) {
            existing.push(val);
          } else {
            parsed[key] = [existing, val];
          }
        } else {
          parsed[key] = val;
        }
      }
      this._query = parsed as TQuery;
    }
    return this._query;
  }

  get body(): TBody {
    return this._body as TBody;
  }

  setBody(body: TBody): void {
    this._body = body;
  }

  private _formData?: FormData;

  async formData(): Promise<FormData> {
    if (!this._formData) {
      this._formData = await this.req.formData();
    }
    return this._formData;
  }

  async file(name: string): Promise<File | null> {
    const fd = await this.formData();
    const val = fd.get(name);
    if (val && typeof val === 'object' && 'name' in val && 'size' in val) {
      return val as File;
    }
    return null;
  }

  async files(name?: string): Promise<File[]> {
    const fd = await this.formData();
    const result: File[] = [];
    if (name) {
      const all = fd.getAll(name);
      for (const val of all) {
        if (val && typeof val === 'object' && 'name' in val && 'size' in val) {
          result.push(val as File);
        }
      }
    } else {
      fd.forEach((val) => {
        if (val && typeof val === 'object' && 'name' in val && 'size' in val) {
          result.push(val as File);
        }
      });
    }
    return result;
  }

  async parseBody(maxBytes?: number): Promise<TBody> {
    if (this._body !== undefined) return this._body;

    const contentLength = this.req.headers.get('content-length');
    if (maxBytes && contentLength && parseInt(contentLength, 10) > maxBytes) {
      throw new (await import('./error')).PayloadTooLargeError(
        `Payload size of ${contentLength} bytes exceeds the maximum limit of ${maxBytes} bytes`
      );
    }

    const contentType = this.req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        this._body = (await this.req.json()) as TBody;
      } catch {
        this._body = {} as TBody;
      }
    } else if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const fd = await this.formData();
      const obj: Record<string, any> = {};
      fd.forEach((value, key) => {
        obj[key] = value;
      });
      this._body = obj as TBody;
    } else if (contentType.includes('text/')) {
      this._body = (await this.req.text()) as unknown as TBody;
    } else {
      this._body = (await this.req.arrayBuffer()) as unknown as TBody;
    }

    return this._body;
  }

  status(code: number): this {
    this._status = code;
    return this;
  }

  get responseHeaders(): Headers {
    if (!this._responseHeaders) {
      this._responseHeaders = new Headers();
    }
    return this._responseHeaders;
  }

  setHeader(name: string, value: string): this {
    this.responseHeaders.set(name, value);
    return this;
  }

  getHeader(name: string): string | null {
    return this.req.headers.get(name);
  }

  setCookie(name: string, value: string, options: CookieOptions = {}): this {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    if (options.maxAge !== undefined) cookie += `; Max-Age=${options.maxAge}`;
    if (options.domain) cookie += `; Domain=${options.domain}`;
    if (options.path) cookie += `; Path=${options.path}`;
    else cookie += '; Path=/';
    if (options.expires) cookie += `; Expires=${options.expires.toUTCString()}`;
    if (options.httpOnly) cookie += '; HttpOnly';
    if (options.secure) cookie += '; Secure';
    if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;

    this.responseHeaders.append('Set-Cookie', cookie);
    return this;
  }

  getCookie(name: string): string | undefined {
    const cookieHeader = this.req.headers.get('cookie');
    if (!cookieHeader) return undefined;

    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
      const [k, v] = cookie.trim().split('=');
      if (k === name) {
        return v ? decodeURIComponent(v) : '';
      }
    }
    return undefined;
  }

  json(data: unknown, statusCode?: number): Response {
    if (!this._responseHeaders && (statusCode === undefined || statusCode === 200)) {
      return json(data);
    }
    const res = json(data, {
      status: statusCode ?? this._status,
      headers: this._responseHeaders,
    });
    return res;
  }

  text(str: string, statusCode?: number): Response {
    const res = text(str, {
      status: statusCode ?? this._status,
      headers: this._responseHeaders,
    });
    return res;
  }

  html(htmlStr: string, statusCode?: number): Response {
    const res = html(htmlStr, {
      status: statusCode ?? this._status,
      headers: this._responseHeaders,
    });
    return res;
  }

  redirect(url: string, status = 302): Response {
    this.responseHeaders.set('Location', url);
    return new Response(null, {
      status,
      headers: this._responseHeaders,
    });
  }

  getResponseHeaders(): Headers | undefined {
    return this._responseHeaders;
  }
}

export { VoltContext as Context };
