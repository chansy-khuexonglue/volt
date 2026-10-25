export interface OpenApiInfo {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
}

export interface SecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  description?: string;
  name?: string; // for apiKey
  in?: 'query' | 'header' | 'cookie'; // for apiKey
  scheme?: string; // for http (e.g. 'bearer', 'basic')
  bearerFormat?: string; // for http bearer (e.g. 'JWT')
  flows?: Record<string, any>;
  openIdConnectUrl?: string;
}

export interface OpenApiOptions {
  info?: OpenApiInfo;
  path?: string; // path to documentation UI (default: '/docs' or '/swagger')
  specPath?: string; // path to JSON spec (default: '/openapi.json')
  servers?: Array<{ url: string; description?: string }>;
  ui?: 'swagger' | 'scalar' | 'both';
  swaggerPath?: string; // path to Swagger UI when ui is 'both' (default: '/swagger')
  securitySchemes?: Record<string, SecurityScheme>;
  security?: Array<Record<string, string[]>>;
  openapiVersion?: '3.0.3' | '3.1.0';
}

export type SwaggerOptions = Omit<OpenApiOptions, 'ui'>;

export interface OpenApiSpec {
  openapi: string;
  info: OpenApiInfo;
  servers?: Array<{ url: string; description?: string }>;
  paths: Record<string, Record<string, any>>;
  components?: {
    schemas?: Record<string, any>;
    securitySchemes?: Record<string, SecurityScheme>;
  };
  security?: Array<Record<string, string[]>>;
}
