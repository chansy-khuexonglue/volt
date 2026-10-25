import { Schema } from '@volt/validator';
import { OpenApiInfo, OpenApiSpec, SecurityScheme } from './types';

export function schemaToOpenApi(schema?: Schema): Record<string, any> {
  if (!schema) return { type: 'object' };

  switch (schema.type) {
    case 'string': {
      const s = schema as any;
      const res: Record<string, any> = { type: 'string' };
      if (s.minLength !== undefined) res.minLength = s.minLength;
      if (s.maxLength !== undefined) res.maxLength = s.maxLength;
      if (s.pattern) res.pattern = s.pattern.source;
      if (s.format) res.format = s.format;
      if (s.description) res.description = s.description;
      return res;
    }

    case 'number': {
      const n = schema as any;
      const res: Record<string, any> = { type: n.integer ? 'integer' : 'number' };
      if (n.min !== undefined) res.minimum = n.min;
      if (n.max !== undefined) res.maximum = n.max;
      if (n.description) res.description = n.description;
      return res;
    }

    case 'boolean':
      return { type: 'boolean' };

    case 'object': {
      const o = schema as any;
      const properties: Record<string, any> = {};
      for (const [key, prop] of Object.entries(o.properties || {})) {
        properties[key] = schemaToOpenApi(prop as Schema);
      }
      return {
        type: 'object',
        properties,
        required: o.required || [],
        additionalProperties: o.additionalProperties !== false,
      };
    }

    case 'array': {
      const a = schema as any;
      return {
        type: 'array',
        items: schemaToOpenApi(a.items),
        minItems: a.minItems,
        maxItems: a.maxItems,
      };
    }

    case 'literal': {
      const l = schema as any;
      return {
        type: typeof l.value,
        enum: [l.value],
      };
    }

    case 'enum': {
      const e = schema as any;
      return {
        type: typeof e.values[0],
        enum: e.values,
      };
    }

    case 'union': {
      const u = schema as any;
      return {
        anyOf: u.schemas.map((s: Schema) => schemaToOpenApi(s)),
      };
    }

    default:
      return {};
  }
}

export function generateOpenApiSpec(
  routes: Array<{
    method: string;
    path: string;
    schema?: any;
    middlewares?: any[];
  }>,
  info: OpenApiInfo = { title: 'Volt API', version: '1.0.0' },
  servers: Array<{ url: string; description?: string }> = [{ url: '/' }],
  extraOptions: {
    securitySchemes?: Record<string, SecurityScheme>;
    security?: Array<Record<string, string[]>>;
    openapiVersion?: '3.0.3' | '3.1.0';
  } = {}
): OpenApiSpec {
  const paths: Record<string, Record<string, any>> = {};

  // Default security schemes if not explicitly passed
  const securitySchemes: Record<string, SecurityScheme> = extraOptions.securitySchemes || {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter your JWT token (without "Bearer " prefix)',
    },
  };

  for (const r of routes) {
    // Convert Bun/Volt path syntax /users/:id to OpenAPI syntax /users/{id}
    const openApiPath = r.path
      .replace(/:([a-zA-Z0-9_]+)/g, '{$1}')
      .replace(/\*([a-zA-Z0-9_]*)/g, '{$1}');
    const method = r.method.toLowerCase();

    if (!paths[openApiPath]) {
      paths[openApiPath] = {};
    }

    const operation: Record<string, any> = {
      summary: r.schema?.summary || `${r.method} ${r.path}`,
      description: r.schema?.description || '',
      tags: r.schema?.tags || ['Default'],
      parameters: [],
      responses: {
        '200': {
          description: 'Successful response',
        },
      },
    };

    // Attach security if route specifies security or has auth tags
    if (r.schema?.security) {
      operation.security = r.schema.security;
    } else if (
      r.schema?.tags?.some((t: string) => /auth|admin|user|protected/i.test(t)) ||
      r.middlewares?.some((m: any) => m.name === 'jwt')
    ) {
      operation.security = [{ bearerAuth: [] }];
    }

    // Extract path parameters
    const paramMatches = r.path.match(/:([a-zA-Z0-9_]+)/g) || [];
    for (const p of paramMatches) {
      const paramName = p.slice(1);
      operation.parameters.push({
        name: paramName,
        in: 'path',
        required: true,
        schema: { type: 'string' },
      });
    }

    // Query parameters
    if (r.schema?.query && r.schema.query.type === 'object') {
      const props = r.schema.query.properties || {};
      for (const [key, propSchema] of Object.entries(props)) {
        operation.parameters.push({
          name: key,
          in: 'query',
          required: r.schema.query.required?.includes(key) || false,
          schema: schemaToOpenApi(propSchema as Schema),
        });
      }
    }

    // Header parameters
    if (r.schema?.headers && r.schema.headers.type === 'object') {
      const props = r.schema.headers.properties || {};
      for (const [key, propSchema] of Object.entries(props)) {
        operation.parameters.push({
          name: key,
          in: 'header',
          required: r.schema.headers.required?.includes(key) || false,
          schema: schemaToOpenApi(propSchema as Schema),
        });
      }
    }

    // Request body
    if (r.schema?.body && ['post', 'put', 'patch'].includes(method)) {
      operation.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: schemaToOpenApi(r.schema.body),
          },
        },
      };
    }

    // Responses
    if (r.schema?.response) {
      operation.responses = {};
      for (const [status, respSchema] of Object.entries(r.schema.response)) {
        operation.responses[status] = {
          description: `Response status ${status}`,
          content: {
            'application/json': {
              schema: schemaToOpenApi(respSchema as Schema),
            },
          },
        };
      }
    }

    paths[openApiPath]![method] = operation;
  }

  return {
    openapi: extraOptions.openapiVersion || '3.0.3',
    info,
    servers,
    paths,
    components: {
      securitySchemes,
    },
    security: extraOptions.security,
  };
}
