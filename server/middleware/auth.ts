import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { HttpError } from '../handlers/httpError.js';
import { verifyToken } from '../services/authService.js';

export type AuthUser = {
  userId: number;
  email: string;
  role: string;
  branchId: number | null;
};

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('authorization');

  if (!header?.startsWith('Bearer ')) {
    next(new HttpError(401, 'Missing bearer token'));
    return;
  }

  try {
    const payload = verifyToken(header.slice('Bearer '.length));
    req.user = {
      userId: Number(payload.sub),
      email: payload.email,
      role: payload.role,
      branchId: payload.branchId,
    };
    next();
  } catch (error) {
    next(new HttpError(401, 'Invalid or expired token'));
  }
}

export function requireRoles(...roles: string[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new HttpError(401, 'Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new HttpError(403, 'Insufficient permissions'));
      return;
    }

    next();
  };
}

export function requireSelfOrRoles(paramName: string, ...roles: string[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new HttpError(401, 'Authentication required'));
      return;
    }

    const requestedUserId = Number(req.params[paramName]);
    if (req.user.userId === requestedUserId || roles.includes(req.user.role)) {
      next();
      return;
    }

    next(new HttpError(403, 'Insufficient permissions'));
  };
}
