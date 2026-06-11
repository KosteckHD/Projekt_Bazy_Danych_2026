import { Router } from 'express';
import { z } from 'zod';
import * as rentsController from '../controllers/rentsController.js';
import { asyncHandler } from '../handlers/asyncHandler.js';
import { dateTimeSchema, idParamSchema, moneySchema, paymentMethods, validate } from '../middleware/validate.js';

const router = Router();

const rentCreateSchema = z.object({
  userId: z.coerce.number().int().positive(),
  carId: z.coerce.number().int().positive(),
  workerId: z.coerce.number().int().positive().optional().nullable(),
  pickupBranchId: z.coerce.number().int().positive().optional().nullable(),
  returnBranchId: z.coerce.number().int().positive().optional().nullable(),
  startDate: dateTimeSchema,
  expectedEndDate: dateTimeSchema,
  additionalCost: moneySchema.default(0),
  status: z.enum(['Pending', 'Started']).default('Pending'),
});

const rentUpdateSchema = rentCreateSchema
  .omit({ userId: true, carId: true })
  .partial()
  .extend({
    status: z.enum(['Pending', 'Cancelled']).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');

const availabilitySchema = z.object({
  carId: z.coerce.number().int().positive(),
  startDate: dateTimeSchema,
  expectedEndDate: dateTimeSchema,
  ignoreRentId: z.coerce.number().int().positive().optional(),
});

const startRentSchema = z.object({
  workerId: z.coerce.number().int().positive(),
  startDate: dateTimeSchema.optional(),
});

const finishRentSchema = z.object({
  staffId: z.coerce.number().int().positive(),
  endDate: dateTimeSchema.optional(),
  additionalCost: moneySchema.optional(),
  lateFee: moneySchema.optional(),
  returnBranchId: z.coerce.number().int().positive().optional().nullable(),
  mileage: z.coerce.number().int().nonnegative().optional(),
  carStatus: z.enum(['Available', 'Maintenance', 'Damaged']).default('Available'),
  paymentMethod: z.enum(paymentMethods).optional(),
  createPayment: z.coerce.boolean().default(true),
  damageDescription: z.string().trim().min(1).optional(),
  damageRepairCost: moneySchema.default(0),
});

const cancelNoShowSchema = z.object({
  staffId: z.coerce.number().int().positive(),
  cancellationFee: moneySchema.default(0),
  paymentMethod: z.enum(paymentMethods).optional(),
});

router.get('/', asyncHandler(rentsController.listRents));
router.get('/current', asyncHandler(rentsController.listCurrentRents));
router.get('/pending', asyncHandler(rentsController.listPendingRents));
router.get('/overdue', asyncHandler(rentsController.listOverdueRents));
router.get(
  '/availability',
  validate({ query: availabilitySchema }),
  asyncHandler(rentsController.checkAvailability),
);
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(rentsController.getRent));
router.post('/', validate({ body: rentCreateSchema }), asyncHandler(rentsController.createRent));
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: rentUpdateSchema }),
  asyncHandler(rentsController.updateRent),
);
router.post(
  '/:id/start',
  validate({ params: idParamSchema, body: startRentSchema }),
  asyncHandler(rentsController.startRent),
);
router.post(
  '/:id/finish',
  validate({ params: idParamSchema, body: finishRentSchema }),
  asyncHandler(rentsController.finishRent),
);
router.post(
  '/:id/cancel-no-show',
  validate({ params: idParamSchema, body: cancelNoShowSchema }),
  asyncHandler(rentsController.cancelNoShowRent),
);
router.delete('/:id', validate({ params: idParamSchema }), asyncHandler(rentsController.deleteRent));

export default router;
