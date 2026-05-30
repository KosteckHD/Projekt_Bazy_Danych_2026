import { Router } from 'express';
import { z } from 'zod';
import * as branchesController from '../controllers/branchesController.js';
import { asyncHandler } from '../handlers/asyncHandler.js';
import { idParamSchema, validate } from '../middleware/validate.js';

const router = Router();

const branchCreateSchema = z.object({
  branchName: z.string().trim().min(1).max(255),
  address: z.string().trim().min(1).max(255),
  phone: z.string().trim().regex(/^\+?[0-9]{9,15}$/).optional().nullable(),
  email: z.string().trim().email().max(255).optional().nullable(),
  isActive: z.coerce.boolean().default(true),
});

const branchUpdateSchema = branchCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Provide at least one field to update',
);

router.get('/', asyncHandler(branchesController.listBranches));
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(branchesController.getBranch));
router.get(
  '/:id/cars',
  validate({ params: idParamSchema }),
  asyncHandler(branchesController.listBranchCars),
);
router.post('/', validate({ body: branchCreateSchema }), asyncHandler(branchesController.createBranch));
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: branchUpdateSchema }),
  asyncHandler(branchesController.updateBranch),
);
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(branchesController.deleteBranch),
);

export default router;
