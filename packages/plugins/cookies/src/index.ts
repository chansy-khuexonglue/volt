import { Volt, VoltPlugin, VoltContext, CookieOptions } from '@voltts/core';
import { signCookie, unsignCookie } from './signer';
import { CookiesPluginOptions, CookieContextHelper } from './types';

export * from './types';
export * from './signer';

export function cookiesPlugin(options: CookiesPluginOptions = {}): VoltPlugin {
  const secret = options.secret
    ? Array.isArray(options.secret)
      ? options.secret[0]
      : options.secret
    : undefined;

  const defaultCookieOpts: CookieOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    ...options.defaults,
  };

  return {
    name: '@voltts/plugin-cookies',
    version: '0.1.0',
    setup(app: Volt) {
      app.decorate('cookies', {
        sign: (val: string, sec?: string) => signCookie(val, sec || secret || ''),
        unsign: (val: string, sec?: string) => unsignCookie(val, sec || secret || ''),
      });

      // Middleware injecting cookie helper onto ctx.store.cookies
      app.use(async (c: VoltContext, next) => {
        const cookiesHelper: CookieContextHelper = {
          get(name: string): string | undefined {
            return c.getCookie(name);
          },
          getSigned(name: string): string | false | undefined {
            const raw = c.getCookie(name);
            if (!raw) return undefined;
            if (!secret) {
              throw new Error('[@voltts/plugin-cookies] Cookie secret not configured for verification.');
            }
            return unsignCookie(raw, secret);
          },
          set(name: string, value: string, opts?: CookieOptions): void {
            c.setCookie(name, value, { ...defaultCookieOpts, ...opts });
          },
          setSigned(name: string, value: string, opts?: CookieOptions): void {
            if (!secret) {
              throw new Error('[@voltts/plugin-cookies] Cookie secret not configured for signing.');
            }
            const signed = signCookie(value, secret);
            c.setCookie(name, signed, { ...defaultCookieOpts, ...opts });
          },
          delete(name: string, opts?: Pick<CookieOptions, 'domain' | 'path'>): void {
            c.setCookie(name, '', {
              ...defaultCookieOpts,
              ...opts,
              maxAge: 0,
              expires: new Date(0),
            });
          },
        };

        c.store.cookies = cookiesHelper;
        (c as any).cookies = cookiesHelper;

        return next();
      });
    },
  };
}

export default cookiesPlugin;
