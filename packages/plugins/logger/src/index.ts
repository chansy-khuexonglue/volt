import { Volt, VoltPlugin } from '@volt/core';
import { logger as loggerMiddleware, LoggerOptions } from '@volt/middleware';

export type PluginLoggerOptions = LoggerOptions;

export interface LoggerInstance {
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

export function loggerPlugin(options: PluginLoggerOptions = {}): VoltPlugin {
  const isJson = options.format === 'json';

  const loggerInstance: LoggerInstance = {
    info: (msg, meta) => {
      if (isJson) console.log(JSON.stringify({ level: 'info', msg, meta, time: new Date().toISOString() }));
      else console.log(`[Volt:INFO] ${msg}`, meta ? meta : '');
    },
    warn: (msg, meta) => {
      if (isJson) console.warn(JSON.stringify({ level: 'warn', msg, meta, time: new Date().toISOString() }));
      else console.warn(`[Volt:WARN] ${msg}`, meta ? meta : '');
    },
    error: (msg, meta) => {
      if (isJson) console.error(JSON.stringify({ level: 'error', msg, meta, time: new Date().toISOString() }));
      else console.error(`[Volt:ERROR] ${msg}`, meta ? meta : '');
    },
    debug: (msg, meta) => {
      if (isJson) console.debug(JSON.stringify({ level: 'debug', msg, meta, time: new Date().toISOString() }));
      else console.debug(`[Volt:DEBUG] ${msg}`, meta ? meta : '');
    },
  };

  return {
    name: '@volt/plugin-logger',
    version: '0.1.0',
    setup(app: Volt) {
      app.decorate('logger', loggerInstance);
      app.use(loggerMiddleware(options));
    },
  };
}

export default loggerPlugin;
