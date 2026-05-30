import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { asyncHandler } from '../handlers/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { userCreateSchema } from './usersRoutes.js';

const router = Router();

router.post(
  '/register',
  validate({ body: userCreateSchema.omit({ role: true }).extend({ role: userCreateSchema.shape.role.optional() }) }),
  asyncHandler(authController.register),
);

export default router;
