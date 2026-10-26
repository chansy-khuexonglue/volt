import { Volt, VoltPlugin, VoltContext } from '@voltts/core';
import { PrismaClientLike, PrismaPluginOptions } from './types';
import { prismaErrorMiddleware } from './errors';

export * from './types';
export * from './errors';

export class MemoryPrismaClient implements PrismaClientLike {
  private connected = false;

  async $connect(): Promise<void> {
    this.connected = true;
  }

  async $disconnect(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export function prismaPlugin(options: PrismaPluginOptions = {}): VoltPlugin {
  let client: PrismaClientLike;

  if (typeof options.client === 'function') {
    const res = options.client();
    client = res instanceof Promise ? ({} as any) : res;
  } else if (options.client) {
    client = options.client;
  } else {
    // Default mock memory client for tests and rapid local dev
    client = new MemoryPrismaClient();
  }

  return {
    name: '@voltts/plugin-prisma',
    version: '0.1.0',
    setup(app: Volt) {
      app.decorate('prisma', client);

      // Optionally inject prisma into context store
      if (options.injectContext !== false) {
        app.use(async (c: VoltContext, next) => {
          c.store.prisma = client;
          return next();
        });
      }

      // Automatically translate Prisma error codes if enabled
      if (options.handleErrors !== false) {
        app.use(prismaErrorMiddleware());
      }
    },
    async cleanup() {
      if (client.$disconnect) {
        await client.$disconnect();
      }
    },
  };
}

export default prismaPlugin;
