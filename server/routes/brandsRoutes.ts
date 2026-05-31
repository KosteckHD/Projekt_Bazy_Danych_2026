import { Router } from 'express';
import { z } from 'zod';
import * as brandsController from '../controllers/brandsController.js';
import { asyncHandler } from '../handlers/asyncHandler.js';
import { countries, idParamSchema, validate } from '../middleware/validate.js';

const router = Router();

const brandCreateSchema = z.object({
  brandName: z.string().trim().min(1).max(255),
  country: z.enum(countries),
});

const brandUpdateSchema = brandCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Provide at least one field to update',
);

router.get('/', asyncHandler(brandsController.listBrands));
router.get(
  '/:brandId/models',
  validate({ params: z.object({ brandId: z.coerce.number().int().positive() }) }),
  asyncHandler(brandsController.listBrandModels),
);
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(brandsController.getBrand));
router.post('/', validate({ body: brandCreateSchema }), asyncHandler(brandsController.createBrand));
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: brandUpdateSchema }),
  asyncHandler(brandsController.updateBrand),
);
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(brandsController.deleteBrand),
);

export default router;
