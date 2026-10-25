export function renderSwaggerUI(
  specUrl: string,
  title = 'Volt API Documentation',
  inlineSpec?: Record<string, any>
): string {
  const specConfig = inlineSpec
    ? `spec: ${JSON.stringify(inlineSpec)},`
    : `url: "${specUrl}",`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} | Swagger UI</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin: 0;
      background: #fdfdfd;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .swagger-ui .topbar {
      background-color: #111827;
      padding: 10px 0;
      border-bottom: 2px solid #3b82f6;
    }
    .swagger-ui .topbar a {
      max-width: none;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ffffff;
      font-size: 1.15rem;
      font-weight: 700;
      text-decoration: none;
    }
    .swagger-ui .topbar a span {
      color: #60a5fa;
    }
    .swagger-ui .topbar img {
      display: none;
    }
    .swagger-ui .info {
      margin: 25px 0;
    }
    .swagger-ui .info .title {
      font-size: 2rem;
      font-weight: 800;
      color: #111827;
    }
    .swagger-ui .btn.authorize {
      color: #2563eb;
      border-color: #2563eb;
      background: #eff6ff;
      border-radius: 6px;
      font-weight: 600;
    }
    .swagger-ui .btn.authorize svg {
      fill: #2563eb;
    }
    .swagger-ui .opblock {
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid rgba(0,0,0,0.08);
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js" crossorigin="anonymous"></script>
  <script>
    window.onload = function() {
      var presets = [SwaggerUIBundle.presets.apis];
      if (typeof SwaggerUIStandalonePreset !== 'undefined') {
        presets.push(SwaggerUIStandalonePreset);
      }
      window.ui = SwaggerUIBundle({
        ${specConfig}
        dom_id: '#swagger-ui',
        deepLinking: true,
        displayRequestDuration: true,
        docExpansion: 'list',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        presets: presets,
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: typeof SwaggerUIStandalonePreset !== 'undefined' ? 'StandaloneLayout' : 'BaseLayout'
      });

      // Inject custom branding in topbar
      setTimeout(function() {
        var topbarLink = document.querySelector('.swagger-ui .topbar a');
        if (topbarLink) {
          topbarLink.innerHTML = '⚡ <span>Volt</span> API Documentation';
        }
      }, 100);
    };
  </script>
</body>
</html>`;
}

export function renderScalarUI(
  specUrl: string,
  title = 'Volt API Reference',
  inlineSpec?: Record<string, any>
): string {
  const specElement = inlineSpec
    ? `<script id="api-reference" type="application/json">${JSON.stringify(inlineSpec)}</script>`
    : `<script id="api-reference" data-url="${specUrl}"></script>`;

  return `<!doctype html>
<html>
  <head>
    <title>${title}</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    ${specElement}
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;
}
