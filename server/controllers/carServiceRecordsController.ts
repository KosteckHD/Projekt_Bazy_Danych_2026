import type { Request, Response } from 'express';
import * as carServiceRecordsService from '../services/carServiceRecordsService.js';

export async function listServices(_req: Request, res: Response) {
  res.json(await carServiceRecordsService.listServices());
}

export async function listServicesByCar(req: Request, res: Response) {
  res.json(await carServiceRecordsService.listServicesByCar(Number(req.params.id)));
}

export async function createService(req: Request, res: Response) {
  const service = await carServiceRecordsService.createService(req.body);
  res.status(201).json(service);
}

export async function updateService(req: Request, res: Response) {
  res.json(await carServiceRecordsService.updateService(Number(req.params.id), req.body));
}

export async function deleteService(req: Request, res: Response) {
  await carServiceRecordsService.deleteService(Number(req.params.id));
  res.status(204).send();
}
