import { Router } from 'express';
import { z } from 'zod';
import * as authController from '../controllers/authController.js';
import { asyncHandler } from '../handlers/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { userCreateSchema } from './usersRoutes.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

router.post(
  '/register',
  validate({ body: userCreateSchema.omit({ role: true, branchId: true }) }),
  asyncHandler(authController.register),
);
router.post('/login', validate({ body: loginSchema }), asyncHandler(authController.login));

export default router;
