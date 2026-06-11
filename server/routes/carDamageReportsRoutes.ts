import { Router } from 'express';
import { z } from 'zod';
import * as carDamageReportsController from '../controllers/carDamageReportsController.js';
import { asyncHandler } from '../handlers/asyncHandler.js';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { idParamSchema, moneySchema, validate } from '../middleware/validate.js';

const router = Router();

const damageCreateSchema = z.object({
  carId: z.coerce.number().int().positive(),
  rentId: z.coerce.number().int().positive().optional().nullable(),
  description: z.string().trim().min(1),
  repairCost: moneySchema.default(0),
});

const damageUpdateSchema = z
  .object({
    description: z.string().trim().min(1).optional(),
    repairCost: moneySchema.optional(),
    isResolved: z.coerce.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');

router.use(authenticate, requireRoles('Worker', 'Manager', 'Admin'));

router.get('/', asyncHandler(carDamageReportsController.listDamages));
router.post(
  '/',
  validate({ body: damageCreateSchema }),
  asyncHandler(carDamageReportsController.createDamage),
);
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: damageUpdateSchema }),
  asyncHandler(carDamageReportsController.updateDamage),
);
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(carDamageReportsController.deleteDamage),
);

export default router;
