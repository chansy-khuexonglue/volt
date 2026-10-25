import { CookieOptions } from '@volt/core';

export interface CookiesPluginOptions {
  /**
   * Secret key used to sign and verify cookies (HMAC-SHA256)
   */
  secret?: string | string[];

  /**
   * Default cookie options applied when setting cookies
   */
  defaults?: CookieOptions;
}

export interface CookieContextHelper {
  get(name: string): string | undefined;
  getSigned(name: string): string | false | undefined;
  set(name: string, value: string, options?: CookieOptions): void;
  setSigned(name: string, value: string, options?: CookieOptions): void;
  delete(name: string, options?: Pick<CookieOptions, 'domain' | 'path'>): void;
}
