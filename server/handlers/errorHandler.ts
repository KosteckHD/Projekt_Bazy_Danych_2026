import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from './httpError.js';

type PgError = Error & {
  code?: string;
  detail?: string;
  constraint?: string;
};

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({
      message: error.message,
      details: error.details,
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed',
      details: error.issues,
    });
    return;
  }

  const pgError = error as PgError;
  if (pgError.code === '23505') {
    if (pgError.constraint?.toLowerCase().includes('vin') || pgError.detail?.toLowerCase().includes('vin')) {
      res.status(409).json({
        message: 'Samochód o podanym numerze VIN jest już zarejestrowany w bazie.',
      });
      return;
    }
    res.status(409).json({
      message: 'Unique constraint violation',
      details: pgError.detail,
    });
    return;
  }

  if (pgError.code === '23514') {
    if (pgError.constraint?.toLowerCase().includes('vin') || pgError.detail?.toLowerCase().includes('vin')) {
      res.status(400).json({
        message: 'Podany numer VIN ma nieprawidłowy format (powinien składać się z 17 znaków alfanumerycznych i nie zawierać liter I, O, Q).',
      });
      return;
    }
    res.status(400).json({
      message: 'Check constraint violation',
      details: pgError.constraint,
    });
    return;
  }

  if (pgError.code === '23503') {
    res.status(409).json({
      message: 'Related resource does not exist or is still in use',
      details: pgError.detail,
    });
    return;
  }

  if (pgError.code === '23P01') {
    res.status(409).json({
      message: 'Car is not available in the selected period',
      details: pgError.constraint,
    });
    return;
  }

  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
}
