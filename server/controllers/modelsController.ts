import type { Request, Response } from 'express';
import * as modelsService from '../services/modelsService.js';

export async function listModels(_req: Request, res: Response) {
  res.json(await modelsService.listModels());
}

export async function getModel(req: Request, res: Response) {
  res.json(await modelsService.getModel(Number(req.params.id)));
}

export async function listModelsByBrand(req: Request, res: Response) {
  res.json(await modelsService.listModelsByBrand(Number(req.params.brandId)));
}

export async function createModel(req: Request, res: Response) {
  const model = await modelsService.createModel(req.body);
  res.status(201).json(model);
}

export async function updateModel(req: Request, res: Response) {
  res.json(await modelsService.updateModel(Number(req.params.id), req.body));
}

export async function deleteModel(req: Request, res: Response) {
  await modelsService.deleteModel(Number(req.params.id));
  res.status(204).send();
}
