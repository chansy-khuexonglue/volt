export * from './types';

export class WebSocketManager<T = any> {
  private handlers = new Map<string, import('./types').WebSocketRouteOptions<T>>();

  register(path: string, options: import('./types').WebSocketRouteOptions<T>): void {
    this.handlers.set(path, options);
  }

  get(path: string): import('./types').WebSocketRouteOptions<T> | undefined {
    return this.handlers.get(path);
  }

  has(path: string): boolean {
    return this.handlers.has(path);
  }

  createBunWebSocketHandler() {
    const defaultOptions = Array.from(this.handlers.values())[0] || {};

    return {
      open: (ws: any) => {
        const handler = this.handlers.get(ws.data?.path) || defaultOptions;
        handler.open?.(ws);
      },
      message: (ws: any, message: any) => {
        const handler = this.handlers.get(ws.data?.path) || defaultOptions;
        handler.message?.(ws, message);
      },
      close: (ws: any, code: number, reason: string) => {
        const handler = this.handlers.get(ws.data?.path) || defaultOptions;
        handler.close?.(ws, code, reason);
      },
      drain: (ws: any) => {
        const handler = this.handlers.get(ws.data?.path) || defaultOptions;
        handler.drain?.(ws);
      },
      error: (ws: any, error: Error) => {
        const handler = this.handlers.get(ws.data?.path) || defaultOptions;
        handler.error?.(ws, error);
      },
    };
  }
}
