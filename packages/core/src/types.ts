import { Schema, Static } from '@volt/validator';

export type ExtractParamNames<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param | ExtractParamNames<`/${Rest}`>
    : T extends `${infer _Start}:${infer Param}`
      ? Param
      : T extends `${infer _Start}*${infer Wildcard}`
        ? Wildcard extends '' ? 'wildcard' : Wildcard
        : never;

export type ExtractParams<T extends string> = [ExtractParamNames<T>] extends [never]
  ? Record<string, string>
  : { [K in ExtractParamNames<T>]: string };

export interface RouteSchemaConfig {
  body?: Schema;
  query?: Schema;
  params?: Schema;
  headers?: Schema;
  response?: Record<number, Schema>;
  tags?: string[];
  summary?: string;
  description?: string;
  security?: Array<Record<string, string[]>>;
}

export interface ContextData<
  TParams = Record<string, string>,
  TBody = unknown,
  TQuery = Record<string, string | string[]>,
  THeaders = Headers,
  TStore = Record<string, any>
> {
  req: Request;
  params: TParams;
  body: TBody;
  query: TQuery;
  headers: THeaders;
  store: TStore;
  url: URL;
}

export type HandlerReturn<T = any> =
  | Response
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, any>
  | Array<any>
  | ReadableStream
  | Blob
  | ArrayBuffer;

export type Handler<
  TParams = Record<string, string>,
  TBody = any,
  TQuery = any,
  TStore = Record<string, any>
> = (
  ctx: import('./context').VoltContext<TParams, TBody, TQuery, TStore>
) => HandlerReturn | Promise<HandlerReturn>;

export interface ServerOptions {
  port?: number;
  hostname?: string;
  development?: boolean;
  tls?: {
    cert: string;
    key: string;
  };
  maxRequestBodySize?: number;
}

export interface LifecycleHooks {
  onStart?: () => void | Promise<void>;
  onStop?: () => void | Promise<void>;
  onError?: (error: Error, req: Request) => Response | Promise<Response>;
}

export interface VoltPlugin {
  name: string;
  version?: string;
  setup: (app: import('./app').Volt) => void | Promise<void>;
  cleanup?: (app: import('./app').Volt) => void | Promise<void>;
}

export interface ModuleConfig {
  name?: string;
  imports?: ModuleConfig[];
  providers?: any[];
  exports?: any[];
  setup?: (app: import('./app').Volt) => void;
}
