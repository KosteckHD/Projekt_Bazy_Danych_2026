import { Router } from 'express';
import { z } from 'zod';
import * as usersController from '../controllers/usersController.js';
import { asyncHandler } from '../handlers/asyncHandler.js';
import { authenticate, requireRoles, requireSelfOrRoles } from '../middleware/auth.js';
import { idParamSchema, roles, validate } from '../middleware/validate.js';

const router = Router();

const dateOnlySchema = z.coerce.date().transform((date) => date.toISOString().slice(0, 10));

export const userCreateSchema = z.object({
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(255),
  firstName: z.string().trim().min(1).max(255),
  lastName: z.string().trim().min(1).max(255),
  phone: z.string().trim().regex(/^\+?[0-9]{9,15}$/),
  role: z.enum(roles).default('Customer'),
  branchId: z.coerce.number().int().positive().optional().nullable(),
  driverLicenseNumber: z.string().trim().max(64).optional().nullable(),
  driverLicenseExpiresAt: dateOnlySchema.optional().nullable(),
  birthDate: dateOnlySchema.optional().nullable(),
  address: z.string().trim().max(255).optional().nullable(),
});

const userUpdateSchema = userCreateSchema
  .omit({ password: true })
  .partial()
  .extend({
    isActive: z.coerce.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');

const roleSchema = z.object({
  role: z.enum(roles),
});

const passwordSchema = z.object({
  password: z.string().min(8).max(255),
});

router.get('/', authenticate, requireRoles('Manager', 'Admin'), asyncHandler(usersController.listUsers));
router.get('/:id', authenticate, requireSelfOrRoles('id', 'Manager', 'Admin'), validate({ params: idParamSchema }), asyncHandler(usersController.getUser));
router.get(
  '/:id/rents',
  authenticate,
  requireSelfOrRoles('id', 'Worker', 'Manager', 'Admin'),
  validate({ params: idParamSchema }),
  asyncHandler(usersController.listUserRents),
);
router.post('/', authenticate, requireRoles('Admin'), validate({ body: userCreateSchema }), asyncHandler(usersController.createUser));
router.patch(
  '/:id',
  authenticate,
  requireSelfOrRoles('id', 'Admin'),
  validate({ params: idParamSchema, body: userUpdateSchema }),
  asyncHandler(usersController.updateUser),
);
router.patch(
  '/:id/role',
  authenticate,
  requireRoles('Admin'),
  validate({ params: idParamSchema, body: roleSchema }),
  asyncHandler(usersController.updateUserRole),
);
router.patch(
  '/:id/password',
  authenticate,
  requireSelfOrRoles('id', 'Admin'),
  validate({ params: idParamSchema, body: passwordSchema }),
  asyncHandler(usersController.updatePassword),
);
router.delete('/:id', authenticate, requireRoles('Admin'), validate({ params: idParamSchema }), asyncHandler(usersController.deleteUser));

export default router;
