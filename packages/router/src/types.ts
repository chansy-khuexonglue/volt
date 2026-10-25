export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS'
  | 'ALL';

export interface RouteMatch<T = unknown> {
  handler: T;
  params: Record<string, string>;
  pattern: string;
  method: HttpMethod | string;
}

export interface RouteRecord<T = unknown> {
  method: HttpMethod | string;
  path: string;
  handler: T;
  metadata?: Record<string, unknown>;
}

export interface RouterOptions {
  strictTrailingSlash?: boolean;
  caseSensitive?: boolean;
}

export class RouteConflictError extends Error {
  constructor(public existingPath: string, public newPath: string, public method: string) {
    super(`Route conflict detected: '${method} ${newPath}' conflicts with existing route '${method} ${existingPath}'`);
    this.name = 'RouteConflictError';
  }
}
