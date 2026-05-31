import { Router } from 'express';
import { z } from 'zod';
import * as modelsController from '../controllers/modelsController.js';
import { asyncHandler } from '../handlers/asyncHandler.js';
import {
  brandIdParamSchema,
  idParamSchema,
  positiveMoneySchema,
  validate,
} from '../middleware/validate.js';

const router = Router();

const modelCreateSchema = z.object({
  modelName: z.string().trim().min(1).max(255),
  brandId: z.coerce.number().int().positive(),
  hourlyCost: positiveMoneySchema,
  modelDescription: z.string().trim().max(255).optional().nullable(),
});

const modelUpdateSchema = modelCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Provide at least one field to update',
);

router.get('/', asyncHandler(modelsController.listModels));
router.get(
  '/by-brand/:brandId',
  validate({ params: brandIdParamSchema }),
  asyncHandler(modelsController.listModelsByBrand),
);
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(modelsController.getModel));
router.post('/', validate({ body: modelCreateSchema }), asyncHandler(modelsController.createModel));
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: modelUpdateSchema }),
  asyncHandler(modelsController.updateModel),
);
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(modelsController.deleteModel),
);

export default router;
