import { GraphiQLOptions } from './types';

export function renderGraphiQL(endpoint: string, options: GraphiQLOptions = {}): string {
  const title = options.title || 'Volt GraphQL Explorer';
  const defaultQuery = options.defaultQuery || '# Welcome to Volt GraphQL API\nquery {\n  __schema {\n    types {\n      name\n    }\n  }\n}\n';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="https://unpkg.com/graphiql@3.0.10/graphiql.min.css" />
  <style>
    body {
      margin: 0;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    #graphiql {
      height: 100vh;
    }
  </style>
</head>
<body>
  <div id="graphiql">Loading Volt GraphQL Explorer...</div>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/graphiql@3.0.10/graphiql.min.js"></script>
  <script>
    const fetcher = GraphiQL.createFetcher({
      url: '${endpoint}',
    });

    const root = ReactDOM.createRoot(document.getElementById('graphiql'));
    root.render(
      React.createElement(GraphiQL, {
        fetcher: fetcher,
        defaultQuery: ${JSON.stringify(defaultQuery)},
        headerEditorEnabled: true,
        shouldPersistHeaders: true,
      })
    );
  </script>
</body>
</html>`;
}
