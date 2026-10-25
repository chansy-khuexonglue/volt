export interface PrismaClientLike {
  $connect?(): Promise<void>;
  $disconnect?(): Promise<void>;
  [key: string]: any;
}

export interface PrismaPluginOptions {
  /**
   * PrismaClient instance or factory function
   */
  client?: PrismaClientLike | (() => PrismaClientLike | Promise<PrismaClientLike>);

  /**
   * Whether to automatically translate Prisma error codes (P2002, P2025, etc.) into HTTP responses
   * (default: true)
   */
  handleErrors?: boolean;

  /**
   * Whether to inject Prisma client into VoltContext store as ctx.store.prisma
   * (default: true)
   */
  injectContext?: boolean;
}
