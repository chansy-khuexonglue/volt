export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
  }

  toResponse(isDev = false): Response {
    const payload: Record<string, unknown> = {
      status: this.status,
      error: this.name,
      message: this.message,
    };

    if (this.details !== undefined) {
      payload.details = this.details;
    }

    if (isDev && this.stack) {
      payload.stack = this.stack;
    }

    return new Response(JSON.stringify(payload), {
      status: this.status,
      headers: {
        'content-type': 'application/json; charset=utf-8',
      },
    });
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad Request', details?: unknown) {
    super(400, message, details);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized', details?: unknown) {
    super(401, message, details);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden', details?: unknown) {
    super(403, message, details);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not Found', details?: unknown) {
    super(404, message, details);
    this.name = 'NotFoundError';
  }
}

export class PayloadTooLargeError extends HttpError {
  constructor(message = 'Payload Too Large', details?: unknown) {
    super(413, message, details);
    this.name = 'PayloadTooLargeError';
  }
}

export class UnsupportedMediaTypeError extends HttpError {
  constructor(message = 'Unsupported Media Type', details?: unknown) {
    super(415, message, details);
    this.name = 'UnsupportedMediaTypeError';
  }
}

export class MethodNotAllowedError extends HttpError {
  constructor(message = 'Method Not Allowed', details?: unknown) {
    super(405, message, details);
    this.name = 'MethodNotAllowedError';
  }
}

export class InternalServerError extends HttpError {
  constructor(message = 'Internal Server Error', details?: unknown) {
    super(500, message, details);
    this.name = 'InternalServerError';
  }
}

export function handleServerException(err: unknown, isDev = false): Response {
  if (err instanceof HttpError) {
    return err.toResponse(isDev);
  }

  const message = err instanceof Error ? err.message : 'Internal Server Error';
  const payload: Record<string, unknown> = {
    status: 500,
    error: 'Internal Server Error',
    message: isDev ? message : 'An unexpected server error occurred',
  };

  if (isDev && err instanceof Error && err.stack) {
    payload.stack = err.stack;
  }

  return new Response(JSON.stringify(payload), {
    status: 500,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
}
