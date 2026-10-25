import { generateOpenApiSpec } from './generator';
import { OpenApiOptions, OpenApiSpec, SwaggerOptions } from './types';
import { renderScalarUI, renderSwaggerUI } from './ui';

export * from './types';
export * from './generator';
export * from './ui';

/**
 * First-class Swagger UI plugin for Volt applications.
 * Mounts interactive Swagger UI documentation at options.path (default: '/swagger').
 */
export function swagger(options: SwaggerOptions = {}) {
  const swaggerPath = options.path || '/swagger';
  const specPath = options.specPath || '/openapi.json';

  return {
    name: '@volt/swagger',
    setup(app: any) {
      // 1. Endpoint returning the OpenAPI specification
      app.get(specPath, () => {
        const routes = typeof app.getRegisteredRoutes === 'function' ? app.getRegisteredRoutes() : [];
        const spec: OpenApiSpec = generateOpenApiSpec(
          routes,
          options.info || { title: 'Volt API', version: '1.0.0' },
          options.servers,
          {
            securitySchemes: options.securitySchemes,
            security: options.security,
            openapiVersion: options.openapiVersion || '3.0.3',
          }
        );
        return new Response(JSON.stringify(spec, null, 2), {
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
      });

      // 2. Swagger UI documentation endpoint
      app.get(swaggerPath, () => {
        const title = options.info?.title || 'Volt API Documentation';
        const routes = typeof app.getRegisteredRoutes === 'function' ? app.getRegisteredRoutes() : [];
        const spec = generateOpenApiSpec(
          routes,
          options.info || { title, version: '1.0.0' },
          options.servers,
          {
            securitySchemes: options.securitySchemes,
            security: options.security,
            openapiVersion: options.openapiVersion || '3.0.3',
          }
        );

        const html = renderSwaggerUI(specPath, title, spec);
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Security-Policy': "default-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net data: blob:;",
          },
        });
      });
    },
  };
}

/**
 * Universal OpenAPI plugin for Volt.
 * Supports Scalar UI, Swagger UI, or both simultaneously.
 */
export function openapi(options: OpenApiOptions = {}) {
  const docsPath = options.path || '/docs';
  const swaggerPath = options.swaggerPath || '/swagger';
  const specPath = options.specPath || '/openapi.json';
  const uiType = options.ui || 'both'; // Defaults to both /docs (Scalar) and /swagger (Swagger UI)

  return {
    name: '@volt/openapi',
    setup(app: any) {
      // 1. Endpoint returning the OpenAPI JSON specification
      app.get(specPath, () => {
        const routes = typeof app.getRegisteredRoutes === 'function' ? app.getRegisteredRoutes() : [];
        const spec: OpenApiSpec = generateOpenApiSpec(
          routes,
          options.info || { title: 'Volt API', version: '1.0.0' },
          options.servers,
          {
            securitySchemes: options.securitySchemes,
            security: options.security,
            openapiVersion: options.openapiVersion || '3.0.3',
          }
        );
        return new Response(JSON.stringify(spec, null, 2), {
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
      });

      const title = options.info?.title || 'Volt API Documentation';

      // 2. Scalar UI Endpoint (when ui is 'scalar' or 'both')
      if (uiType === 'scalar' || uiType === 'both') {
        app.get(docsPath, () => {
          const routes = typeof app.getRegisteredRoutes === 'function' ? app.getRegisteredRoutes() : [];
          const spec = generateOpenApiSpec(
            routes,
            options.info || { title, version: '1.0.0' },
            options.servers,
            {
              securitySchemes: options.securitySchemes,
              security: options.security,
              openapiVersion: options.openapiVersion || '3.0.3',
            }
          );
          const html = renderScalarUI(specPath, title, spec);
          return new Response(html, {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com data: blob:;",
            },
          });
        });
      }

      // 3. Swagger UI Endpoint (when ui is 'swagger' or 'both')
      if (uiType === 'swagger' || uiType === 'both') {
        const targetPath = uiType === 'swagger' ? docsPath : swaggerPath;
        app.get(targetPath, () => {
          const routes = typeof app.getRegisteredRoutes === 'function' ? app.getRegisteredRoutes() : [];
          const spec = generateOpenApiSpec(
            routes,
            options.info || { title, version: '1.0.0' },
            options.servers,
            {
              securitySchemes: options.securitySchemes,
              security: options.security,
              openapiVersion: options.openapiVersion || '3.0.3',
            }
          );
          const html = renderSwaggerUI(specPath, title, spec);
          return new Response(html, {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Content-Security-Policy': "default-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net data: blob:;",
            },
          });
        });
      }
    },
  };
}

export default openapi;
