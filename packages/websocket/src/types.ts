export interface WebSocketClient<T = any> {
  data: T;
  send(message: string | ArrayBuffer | Uint8Array, compress?: boolean): number;
  close(code?: number, reason?: string): void;
  subscribe(topic: string): void;
  unsubscribe(topic: string): void;
  isSubscribed(topic: string): boolean;
  publish(topic: string, message: string | ArrayBuffer | Uint8Array): void;
  cork(callback: (ws: WebSocketClient<T>) => void): void;
}

export interface WebSocketHandler<T = any> {
  open?: (ws: WebSocketClient<T>) => void | Promise<void>;
  message?: (ws: WebSocketClient<T>, message: string | Uint8Array | ArrayBuffer) => void | Promise<void>;
  close?: (ws: WebSocketClient<T>, code: number, reason: string) => void | Promise<void>;
  drain?: (ws: WebSocketClient<T>) => void | Promise<void>;
  error?: (ws: WebSocketClient<T>, error: Error) => void | Promise<void>;
}

export interface WebSocketRouteOptions<T = any> extends WebSocketHandler<T> {
  idleTimeout?: number;
  maxPayloadLength?: number;
  backpressureLimit?: number;
  closeOnBackpressureLimit?: boolean;
}
