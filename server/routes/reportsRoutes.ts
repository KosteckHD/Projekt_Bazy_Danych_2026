import { Router } from 'express';
import { z } from 'zod';
import * as reportsController from '../controllers/reportsController.js';
import { asyncHandler } from '../handlers/asyncHandler.js';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { idParamSchema, paymentMethods, validate } from '../middleware/validate.js';

const router = Router();

const revenueQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  paymentMethod: z.enum(paymentMethods).optional(),
});

router.use(authenticate, requireRoles('Manager', 'Admin'));

router.get('/current-rentals', asyncHandler(reportsController.currentRentals));
router.get('/popular-cars', asyncHandler(reportsController.popularCars));
router.get('/overdue-rents', asyncHandler(reportsController.overdueRents));
router.get(
  '/revenue',
  validate({ query: revenueQuerySchema }),
  asyncHandler(reportsController.revenue),
);
router.get(
  '/customer-history/:id',
  validate({ params: idParamSchema }),
  asyncHandler(reportsController.customerHistory),
);

export default router;
