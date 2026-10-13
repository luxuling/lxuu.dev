import { z } from 'astro/zod';

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);

    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, 'BAD_REQUEST', message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor() {
    super(401, 'UNAUTHORIZED', 'Not authenticated');
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, 'NOT_FOUND', message);
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(code: string, message: string) {
    super(503, code, message);
  }
}

const errorResponse = (status: number, code: string, message: string) =>
  Response.json({ error: { code, message } }, { status });

export const toErrorResponse = (error: unknown) => {
  if (error instanceof HttpError) {
    return errorResponse(error.status, error.code, error.message);
  }

  if (error instanceof z.ZodError) {
    const message = error.issues.map((issue) => issue.message).join('; ');

    return errorResponse(422, 'VALIDATION', message);
  }

  throw error;
};
