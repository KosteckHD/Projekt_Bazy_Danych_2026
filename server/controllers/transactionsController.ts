import type { Request, Response } from 'express';
import * as transactionsService from '../services/transactionsService.js';

export async function listTransactions(_req: Request, res: Response) {
  res.json(await transactionsService.listTransactions());
}

export async function listTransactionsByRent(req: Request, res: Response) {
  res.json(await transactionsService.listTransactionsByRent(Number(req.params.rentId)));
}

export async function getTransaction(req: Request, res: Response) {
  res.json(await transactionsService.getTransaction(Number(req.params.id)));
}

export async function createTransaction(req: Request, res: Response) {
  const transaction = await transactionsService.createTransaction(req.body);
  res.status(201).json(transaction);
}

export async function updateTransaction(req: Request, res: Response) {
  res.json(await transactionsService.updateTransaction(Number(req.params.id), req.body));
}

export async function updateTransactionStatus(req: Request, res: Response) {
  res.json(
    await transactionsService.updateTransactionStatus(
      Number(req.params.id),
      req.body.status,
      req.body.paymentMethod,
    ),
  );
}
