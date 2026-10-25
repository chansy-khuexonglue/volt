import { ResponseInitOptions } from './types';

const JSON_CONTENT_TYPE = 'application/json; charset=utf-8';
const TEXT_CONTENT_TYPE = 'text/plain; charset=utf-8';
const HTML_CONTENT_TYPE = 'text/html; charset=utf-8';
const OCTET_CONTENT_TYPE = 'application/octet-stream';

export function json(data: unknown, init?: number | ResponseInitOptions): Response {
  const options = typeof init === 'number' ? { status: init } : init || {};
  const status = options.status ?? 200;

  // Use Bun's highly optimized Response.json when available
  if (typeof Response.json === 'function') {
    return Response.json(data, {
      ...options,
      status,
      headers: {
        'content-type': JSON_CONTENT_TYPE,
        ...options.headers,
      },
    });
  }

  return new Response(JSON.stringify(data), {
    ...options,
    status,
    headers: {
      'content-type': JSON_CONTENT_TYPE,
      ...options.headers,
    },
  });
}

export function text(text: string, init?: number | ResponseInitOptions): Response {
  const options = typeof init === 'number' ? { status: init } : init || {};
  return new Response(text, {
    ...options,
    status: options.status ?? 200,
    headers: {
      'content-type': TEXT_CONTENT_TYPE,
      ...options.headers,
    },
  });
}

export function html(html: string, init?: number | ResponseInitOptions): Response {
  const options = typeof init === 'number' ? { status: init } : init || {};
  return new Response(html, {
    ...options,
    status: options.status ?? 200,
    headers: {
      'content-type': HTML_CONTENT_TYPE,
      ...options.headers,
    },
  });
}

export function binary(buffer: BodyInit, contentType = OCTET_CONTENT_TYPE, init?: number | ResponseInitOptions): Response {
  const options = typeof init === 'number' ? { status: init } : init || {};
  return new Response(buffer, {
    ...options,
    status: options.status ?? 200,
    headers: {
      'content-type': contentType,
      ...options.headers,
    },
  });
}

export function stream(readable: ReadableStream, contentType = OCTET_CONTENT_TYPE, init?: number | ResponseInitOptions): Response {
  const options = typeof init === 'number' ? { status: init } : init || {};
  return new Response(readable, {
    ...options,
    status: options.status ?? 200,
    headers: {
      'content-type': contentType,
      ...options.headers,
    },
  });
}

export function serializeResponse(value: unknown, defaultStatus = 200): Response {
  if (value instanceof Response) {
    return value;
  }

  if (value === null || value === undefined) {
    return new Response(null, { status: 204 });
  }

  if (typeof value === 'string') {
    return text(value, defaultStatus);
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return text(String(value), defaultStatus);
  }

  if (value instanceof Blob || value instanceof ArrayBuffer || value instanceof Uint8Array) {
    return binary(value as BodyInit, OCTET_CONTENT_TYPE, defaultStatus);
  }

  if (value instanceof ReadableStream) {
    return stream(value, OCTET_CONTENT_TYPE, defaultStatus);
  }

  return json(value, defaultStatus);
}
