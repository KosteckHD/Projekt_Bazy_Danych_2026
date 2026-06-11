import { Router } from 'express';
import { z } from 'zod';
import * as carsController from '../controllers/carsController.js';
import { asyncHandler } from '../handlers/asyncHandler.js';
import {
  bodyTypes,
  carColors,
  carStatuses,
  idParamSchema,
  validate,
} from '../middleware/validate.js';

const router = Router();

const dateOnlySchema = z.coerce.date().transform((date) => date.toISOString().slice(0, 10));
const vinSchema = z
  .string()
  .trim()
  .length(17)
  .transform((value) => value.toUpperCase());

const carCreateBase = {
  branchId: z.coerce.number().int().positive().optional().nullable(),
  status: z.enum(carStatuses).default('Available'),
  color: z.enum(carColors),
  doorAmount: z.coerce.number().int().positive(),
  productionDate: dateOnlySchema,
  VIN: vinSchema,
  registrationNumber: z.string().trim().max(32).optional().nullable(),
  mileage: z.coerce.number().int().nonnegative().default(0),
  carEngine: z.coerce.number().nonnegative(),
  horsePower: z.coerce.number().int().positive(),
  bodyType: z.enum(bodyTypes),
};

const carCreateWithModelIdSchema = z.object({
  modelId: z.coerce.number().int().positive(),
  ...carCreateBase,
});

const carCreateWithBrandModelSchema = z.object({
  brandName: z.string().trim().min(1),
  country: z.string().trim().min(1),
  modelName: z.string().trim().min(1),
  hourlyCost: z.coerce.number().positive(),
  modelDescription: z.string().trim().optional().nullable(),
  ...carCreateBase,
});

const carCreateSchema = z.union([carCreateWithModelIdSchema, carCreateWithBrandModelSchema]);

const carUpdateSchema = carCreateWithModelIdSchema
  .partial()
  .extend({
    isActive: z.coerce.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');

const statusSchema = z.object({
  status: z.enum(carStatuses),
  operatorId: z.coerce.number().int().positive(),
});

const carQuerySchema = z.object({
  brandId: z.coerce.number().int().positive().optional(),
  modelId: z.coerce.number().int().positive().optional(),
  branchId: z.coerce.number().int().positive().optional(),
  status: z.enum(carStatuses).optional(),
  color: z.enum(carColors).optional(),
  bodyType: z.enum(bodyTypes).optional(),
  minHourlyCost: z.coerce.number().nonnegative().optional(),
  maxHourlyCost: z.coerce.number().nonnegative().optional(),
  availableOnly: z.coerce.boolean().optional(),
});

router.get('/', validate({ query: carQuerySchema }), asyncHandler(carsController.listCars));
router.get('/available', asyncHandler(carsController.listAvailableCars));
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(carsController.getCar));
router.get(
  '/:id/rents',
  validate({ params: idParamSchema }),
  asyncHandler(carsController.listCarRents),
);
router.post('/', validate({ body: carCreateSchema }), asyncHandler(carsController.createCar));
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: carUpdateSchema }),
  asyncHandler(carsController.updateCar),
);
router.patch(
  '/:id/status',
  validate({ params: idParamSchema, body: statusSchema }),
  asyncHandler(carsController.updateCarStatus),
);
router.delete('/:id', validate({ params: idParamSchema }), asyncHandler(carsController.deleteCar));

export default router;
