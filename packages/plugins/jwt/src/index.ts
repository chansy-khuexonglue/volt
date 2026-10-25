import { Volt, VoltPlugin } from '@volt/core';
import { decode, jwt as jwtMiddleware, JwtMiddlewareOptions, sign, verify } from '@volt/jwt';

export * from '@volt/jwt';

export interface JwtPluginOptions extends Partial<JwtMiddlewareOptions> {
  secret: string;
  protectAll?: boolean; // if true, protects all endpoints globally
}

export function jwtPlugin(options: JwtPluginOptions): VoltPlugin {
  return {
    name: '@volt/plugin-jwt',
    version: '0.1.0',
    setup(app: Volt) {
      // Decorate application with JWT helpers
      app.decorate('jwt', {
        sign: (payload: any, signOpts?: any) => sign(payload, options.secret, signOpts),
        verify: (token: string, verifyOpts?: any) => verify(token, options.secret, verifyOpts),
        decode,
      });

      if (options.protectAll) {
        app.use(jwtMiddleware(options as JwtMiddlewareOptions));
      }
    },
  };
}

export default jwtPlugin;
