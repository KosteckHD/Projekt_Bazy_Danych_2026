import type { Request, Response } from 'express';
import * as carDamageReportsService from '../services/carDamageReportsService.js';

export async function listDamages(_req: Request, res: Response) {
  res.json(await carDamageReportsService.listDamages());
}

export async function createDamage(req: Request, res: Response) {
  const damage = await carDamageReportsService.createDamage(req.body);
  res.status(201).json(damage);
}

export async function updateDamage(req: Request, res: Response) {
  res.json(await carDamageReportsService.updateDamage(Number(req.params.id), req.body));
}

export async function deleteDamage(req: Request, res: Response) {
  await carDamageReportsService.deleteDamage(Number(req.params.id));
  res.status(204).send();
}
