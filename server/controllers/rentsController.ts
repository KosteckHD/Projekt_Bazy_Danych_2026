import type { Request, Response } from 'express';
import * as rentsService from '../services/rentsService.js';

export async function listRents(_req: Request, res: Response) {
  res.json(await rentsService.listRents());
}

export async function listCurrentRents(_req: Request, res: Response) {
  res.json(await rentsService.listCurrentRents());
}

export async function listPendingRents(_req: Request, res: Response) {
  res.json(await rentsService.listPendingRents());
}

export async function listOverdueRents(_req: Request, res: Response) {
  res.json(await rentsService.listOverdueRents());
}

export async function checkAvailability(req: Request, res: Response) {
  res.json(
    await rentsService.checkAvailability(
      Number(req.query.carId),
      String(req.query.startDate),
      String(req.query.expectedEndDate),
      req.query.ignoreRentId ? Number(req.query.ignoreRentId) : undefined,
    ),
  );
}

export async function getRent(req: Request, res: Response) {
  res.json(await rentsService.getRent(Number(req.params.id)));
}

export async function createRent(req: Request, res: Response) {
  const rent = await rentsService.createRent(req.body);
  res.status(201).json(rent);
}

export async function updateRent(req: Request, res: Response) {
  res.json(await rentsService.updateRent(Number(req.params.id), req.body));
}

export async function startRent(req: Request, res: Response) {
  res.json(
    await rentsService.startRent(
      Number(req.params.id),
      req.body.workerId ?? null,
      req.body.startDate,
    ),
  );
}

export async function finishRent(req: Request, res: Response) {
  res.json(await rentsService.finishRent(Number(req.params.id), req.body));
}

export async function deleteRent(req: Request, res: Response) {
  const result = await rentsService.deleteRent(Number(req.params.id));

  if (result) {
    res.json(result);
    return;
  }

  res.status(204).send();
}
