import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { z } from 'zod';

export const countries = [
  'Germany',
  'Japan',
  'USA',
  'Italy',
  'France',
  'South Korea',
  'United Kingdom',
  'Sweden',
  'China',
  'Czech Republic',
  'Spain',
  'Poland',
] as const;

export const roles = ['Admin', 'Manager', 'Worker', 'Customer', 'Banned'] as const;
export const carStatuses = ['Available', 'Rented', 'Maintenance', 'Damaged'] as const;
export const rentStatuses = ['Started', 'Pending', 'Ended', 'Cancelled'] as const;
export const transactionStatuses = ['Rejected', 'Pending', 'Accepted'] as const;
export const transactionTypes = [
  'RentalPayment',
  'Deposit',
  'Refund',
  'Penalty',
  'Correction',
] as const;
export const carColors = [
  'White',
  'Black',
  'Silver',
  'Grey',
  'Blue',
  'Red',
  'Green',
  'Yellow',
  'Orange',
  'Brown',
  'Beige',
  'Gold',
  'Purple',
  'Burgundy',
  'Other',
] as const;
export const bodyTypes = [
  'SEDAN',
  'HATCHBACK',
  'COMBI',
  'LIFTBACK',
  'COUPE',
  'ROADSTER',
  'TARGA',
  'FASTBACK',
  'MPV',
  'SUV',
  'CROSSOVER',
  'PICKUP',
  'VAN',
  'MINIBUS',
  'LIMUZYNA',
  'CABRIOLET',
  'SHOOTING_BRAKE',
  'LANDULET',
  'UAZ',
] as const;
export const paymentMethods = ['Cash', 'Card', 'Check', 'Gift card', 'Bank transfer'] as const;
export const paymentDirections = ['Incoming', 'Outgoing'] as const;

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const rentIdParamSchema = z.object({
  rentId: z.coerce.number().int().positive(),
});

export const brandIdParamSchema = z.object({
  brandId: z.coerce.number().int().positive(),
});

export const dateTimeSchema = z.coerce.date().transform((date) => date.toISOString());
export const moneySchema = z.coerce.number().nonnegative();
export const positiveMoneySchema = z.coerce.number().positive();

export function validate(schemas: {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
}): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }

    if (schemas.params) {
      req.params = schemas.params.parse(req.params) as Record<string, string>;
    }

    if (schemas.query) {
      Object.defineProperty(req, 'query', {
        value: schemas.query.parse(req.query),
        configurable: true,
        enumerable: true,
      });
    }

    next();
  };
}
