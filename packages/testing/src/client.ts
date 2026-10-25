import { TestClient, TestRequestOptions, TestResponse } from './types';

export function createTestClient(app: { handle: (req: Request) => Promise<Response> }): TestClient {
  async function makeRequest<T = any>(
    method: string,
    path: string,
    options: TestRequestOptions = {}
  ): Promise<TestResponse<T>> {
    let url = path.startsWith('http') ? path : `http://localhost${path.startsWith('/') ? path : '/' + path}`;

    if (options.query) {
      const searchParams = new URLSearchParams();
      for (const [k, v] of Object.entries(options.query)) {
        if (v !== undefined) {
          searchParams.append(k, String(v));
        }
      }
      const qs = searchParams.toString();
      if (qs) {
        url += (url.includes('?') ? '&' : '?') + qs;
      }
    }

    const headers = new Headers(options.headers);
    let bodyContent: BodyInit | undefined = undefined;

    if (options.body !== undefined && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
      if (typeof options.body === 'object' && !(options.body instanceof FormData) && !(options.body instanceof Blob)) {
        if (!headers.has('content-type')) {
          headers.set('content-type', 'application/json');
        }
        bodyContent = JSON.stringify(options.body);
      } else {
        bodyContent = options.body;
      }
    }

    const req = new Request(url, {
      method: method.toUpperCase(),
      headers,
      body: bodyContent,
    });

    const response = await app.handle(req);
    return response as TestResponse<T>;
  }

  return {
    get: (path, options) => makeRequest('GET', path, options),
    post: (path, options) => makeRequest('POST', path, options),
    put: (path, options) => makeRequest('PUT', path, options),
    delete: (path, options) => makeRequest('DELETE', path, options),
    patch: (path, options) => makeRequest('PATCH', path, options),
    head: (path, options) => makeRequest('HEAD', path, options),
    options: (path, options) => makeRequest('OPTIONS', path, options),
    fetch: (req) => app.handle(req),
  };
}
