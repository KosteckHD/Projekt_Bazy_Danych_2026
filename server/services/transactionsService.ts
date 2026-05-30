import { query, queryOne } from '../config/db.js';
import { buildUpdateSet } from '../config/sql.js';
import { conflict, notFound } from '../handlers/httpError.js';

export type TransactionInput = {
  rentId: number;
  status?: string;
  transactionType?: string;
  amount: number;
  direction: string;
  paymentMethod?: string | null;
  externalPaymentId?: string | null;
  invoiceNumber?: string | null;
};

export type TransactionUpdateInput = Omit<Partial<TransactionInput>, 'rentId'>;

const transactionSelect = `
  SELECT
    t.transactionId AS "transactionId",
    t.rentId AS "rentId",
    r.userId AS "userId",
    t.status,
    t.transactionType AS "transactionType",
    t.amount::float AS "amount",
    t.direction,
    t.paymentMethod AS "paymentMethod",
    t.externalPaymentId AS "externalPaymentId",
    t.invoiceNumber AS "invoiceNumber",
    t.createdAt AS "createdAt",
    t.updatedAt AS "updatedAt"
  FROM TransactionHistory t
  JOIN Rents r ON r.rentId = t.rentId
`;

export async function listTransactions() {
  return query(`${transactionSelect} ORDER BY t.createdAt DESC`);
}

export async function listTransactionsByRent(rentId: number) {
  return query(`${transactionSelect} WHERE t.rentId = $1 ORDER BY t.createdAt DESC`, [rentId]);
}

export async function getTransaction(id: number) {
  const transaction = await queryOne(`${transactionSelect} WHERE t.transactionId = $1`, [id]);
  if (!transaction) {
    notFound('Transaction not found');
  }

  return transaction;
}

export async function createTransaction(input: TransactionInput) {
  if (input.status === 'Accepted' && !input.paymentMethod) {
    conflict('Accepted transaction requires paymentMethod');
  }

  return queryOne(
    `
      INSERT INTO TransactionHistory (
        rentId, status, transactionType, amount, direction, paymentMethod,
        externalPaymentId, invoiceNumber
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        transactionId AS "transactionId",
        rentId AS "rentId",
        status,
        transactionType AS "transactionType",
        amount::float AS "amount",
        direction,
        paymentMethod AS "paymentMethod",
        externalPaymentId AS "externalPaymentId",
        invoiceNumber AS "invoiceNumber",
        createdAt AS "createdAt",
        updatedAt AS "updatedAt"
    `,
    [
      input.rentId,
      input.status ?? 'Pending',
      input.transactionType ?? 'RentalPayment',
      input.amount,
      input.direction,
      input.paymentMethod ?? null,
      input.externalPaymentId ?? null,
      input.invoiceNumber ?? null,
    ],
  );
}

export async function updateTransaction(id: number, input: TransactionUpdateInput) {
  const current = await queryOne<{ status: string }>(
    'SELECT status FROM TransactionHistory WHERE transactionId = $1',
    [id],
  );
  if (!current) {
    notFound('Transaction not found');
  }
  if (current.status === 'Accepted') {
    conflict('Accepted transaction cannot be edited; create a correction instead');
  }
  if (input.status === 'Accepted' && !input.paymentMethod) {
    conflict('Accepted transaction requires paymentMethod');
  }

  const values: unknown[] = [];
  const setClause = buildUpdateSet(
    input,
    {
      status: 'status',
      transactionType: 'transactionType',
      amount: 'amount',
      direction: 'direction',
      paymentMethod: 'paymentMethod',
      externalPaymentId: 'externalPaymentId',
      invoiceNumber: 'invoiceNumber',
    },
    values,
  );

  values.push(id);
  return queryOne(
    `
      UPDATE TransactionHistory
      SET ${setClause}
      WHERE transactionId = $${values.length}
      RETURNING
        transactionId AS "transactionId",
        rentId AS "rentId",
        status,
        transactionType AS "transactionType",
        amount::float AS "amount",
        direction,
        paymentMethod AS "paymentMethod",
        externalPaymentId AS "externalPaymentId",
        invoiceNumber AS "invoiceNumber",
        createdAt AS "createdAt",
        updatedAt AS "updatedAt"
    `,
    values,
  );
}

export async function updateTransactionStatus(id: number, status: string, paymentMethod?: string) {
  const current = await queryOne<{ status: string }>(
    'SELECT status FROM TransactionHistory WHERE transactionId = $1',
    [id],
  );
  if (!current) {
    notFound('Transaction not found');
  }
  if (current.status === 'Accepted') {
    conflict('Accepted transaction cannot change status');
  }
  if (status === 'Accepted' && !paymentMethod) {
    conflict('Accepted transaction requires paymentMethod');
  }

  return queryOne(
    `
      UPDATE TransactionHistory
      SET status = $1,
          paymentMethod = COALESCE($2, paymentMethod),
          updatedAt = NOW()
      WHERE transactionId = $3
      RETURNING
        transactionId AS "transactionId",
        status,
        paymentMethod AS "paymentMethod",
        updatedAt AS "updatedAt"
    `,
    [status, paymentMethod ?? null, id],
  );
}
