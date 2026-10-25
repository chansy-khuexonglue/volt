import { Volt, VoltPlugin } from '@volt/core';
import { cors as corsMiddleware, CorsOptions } from '@volt/middleware';

export type { CorsOptions };

export function corsPlugin(options: CorsOptions = {}): VoltPlugin {
  return {
    name: '@volt/plugin-cors',
    version: '0.1.0',
    setup(app: Volt) {
      app.use(corsMiddleware(options));
    },
  };
}

export default corsPlugin;
