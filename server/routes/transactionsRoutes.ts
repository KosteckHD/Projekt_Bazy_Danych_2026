import { Router } from 'express';
import { z } from 'zod';
import * as transactionsController from '../controllers/transactionsController.js';
import { asyncHandler } from '../handlers/asyncHandler.js';
import { authenticate, requireRoles } from '../middleware/auth.js';
import {
  idParamSchema,
  paymentDirections,
  paymentMethods,
  positiveMoneySchema,
  rentIdParamSchema,
  transactionStatuses,
  transactionTypes,
  validate,
} from '../middleware/validate.js';

const router = Router();

const transactionCreateSchema = z.object({
  rentId: z.coerce.number().int().positive(),
  status: z.enum(transactionStatuses).default('Pending'),
  transactionType: z.enum(transactionTypes).default('RentalPayment'),
  amount: positiveMoneySchema,
  direction: z.enum(paymentDirections),
  paymentMethod: z.enum(paymentMethods).optional().nullable(),
  externalPaymentId: z.string().trim().max(255).optional().nullable(),
  invoiceNumber: z.string().trim().max(255).optional().nullable(),
});

const transactionUpdateSchema = transactionCreateSchema
  .omit({ rentId: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');

const statusSchema = z.object({
  status: z.enum(transactionStatuses),
  paymentMethod: z.enum(paymentMethods).optional(),
});

router.use(authenticate, requireRoles('Worker', 'Manager', 'Admin'));

router.get('/', asyncHandler(transactionsController.listTransactions));
router.get(
  '/by-rent/:rentId',
  validate({ params: rentIdParamSchema }),
  asyncHandler(transactionsController.listTransactionsByRent),
);
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(transactionsController.getTransaction),
);
router.post(
  '/',
  validate({ body: transactionCreateSchema }),
  asyncHandler(transactionsController.createTransaction),
);
router.patch(
  '/:id',
  validate({ params: idParamSchema, body: transactionUpdateSchema }),
  asyncHandler(transactionsController.updateTransaction),
);
router.patch(
  '/:id/status',
  validate({ params: idParamSchema, body: statusSchema }),
  asyncHandler(transactionsController.updateTransactionStatus),
);

export default router;
