import { Router } from 'express';
import { z } from 'zod';
import * as carServiceRecordsController from '../controllers/carServiceRecordsController.js';
import { asyncHandler } from '../handlers/asyncHandler.js';
import { idParamSchema, moneySchema, validate } from '../middleware/validate.js';

const router = Router();

const serviceCreateSchema = z.object({
  carId: z.coerce.number().int().positive(),
  description: z.string().trim().min(1),
  serviceDate: z.coerce.date().transform((date) => date.toISOString().slice(0, 10)).optional(),
  cost: moneySchema.default(0),
  isCompleted: z.coerce.boolean().default(false),
});

const serviceUpdateSchema = serviceCreateSchema
  .omit({ carId: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');

router.get('/', asyncHandler(carServiceRecordsController.listServices));
router.get(
  '/by-car/:id',
  validate({ params: idParamSchema }),
  asyncHandler(carServiceRecordsController.listServicesByCar),
);
router.post(
  '/',
  validate({ body: serviceCreateSchema }),
  asyncHandler(carServiceRecordsController.createService),
);
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: serviceUpdateSchema }),
  asyncHandler(carServiceRecordsController.updateService),
);
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(carServiceRecordsController.deleteService),
);

export default router;
