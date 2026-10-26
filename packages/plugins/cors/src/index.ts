import { Volt, VoltPlugin } from '@voltts/core';
import { cors as corsMiddleware, CorsOptions } from '@voltts/middleware';

export type { CorsOptions };

export function corsPlugin(options: CorsOptions = {}): VoltPlugin {
  return {
    name: '@voltts/plugin-cors',
    version: '0.1.0',
    setup(app: Volt) {
      app.use(corsMiddleware(options));
    },
  };
}

export default corsPlugin;
