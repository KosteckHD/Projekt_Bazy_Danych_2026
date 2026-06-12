export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export function notFound(message = 'Resource not found'): never {
  throw new HttpError(404, message);
}

export function conflict(message: string, details?: unknown): never {
  throw new HttpError(409, message, details);
}

export function badRequest(message: string, details?: unknown): never {
  throw new HttpError(400, message, details);
}

export function unauthorized(message = 'Unauthorized', details?: unknown): never {
  throw new HttpError(401, message, details);
}
