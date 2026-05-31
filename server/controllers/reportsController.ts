import type { Request, Response } from 'express';
import * as reportsService from '../services/reportsService.js';

export async function currentRentals(_req: Request, res: Response) {
  res.json(await reportsService.currentRentals());
}

export async function popularCars(_req: Request, res: Response) {
  res.json(await reportsService.popularCars());
}

export async function overdueRents(_req: Request, res: Response) {
  res.json(await reportsService.overdueRents());
}

export async function revenue(req: Request, res: Response) {
  res.json(await reportsService.revenue(req.query));
}

export async function customerHistory(req: Request, res: Response) {
  res.json(await reportsService.customerHistory(Number(req.params.id)));
}
