import { MiddlewareHandler, VoltContext } from '@volt/core';

export function isPrismaError(error: any): boolean {
  return error && (typeof error.code === 'string' && error.code.startsWith('P'));
}

export function formatPrismaError(error: any): { status: number; message: string; details?: any } {
  switch (error.code) {
    case 'P2002':
      return {
        status: 409,
        message: `Unique constraint failed on field(s): ${error.meta?.target ? JSON.stringify(error.meta.target) : 'unknown'}`,
        details: error.meta,
      };
    case 'P2025':
      return {
        status: 404,
        message: error.meta?.cause || 'Record to update, delete, or retrieve not found',
        details: error.meta,
      };
    case 'P2003':
      return {
        status: 400,
        message: `Foreign key constraint failed on field: ${error.meta?.field_name || 'unknown'}`,
        details: error.meta,
      };
    case 'P2000':
      return {
        status: 400,
        message: `Value provided for field exceeds maximum column length: ${error.meta?.column_name || 'unknown'}`,
        details: error.meta,
      };
    default:
      return {
        status: 500,
        message: error.message || 'Database error occurred',
        details: error.meta,
      };
  }
}

export function prismaErrorMiddleware(): MiddlewareHandler {
  return async (c: any, next) => {
    try {
      return await next();
    } catch (err: any) {
      if (isPrismaError(err)) {
        const { status, message, details } = formatPrismaError(err);
        return c.json(
          {
            error: 'DatabaseError',
            code: err.code,
            message,
            ...(details ? { details } : {}),
          },
          status
        );
      }
      throw err;
    }
  };
}
