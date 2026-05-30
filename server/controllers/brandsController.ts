import type { Request, Response } from 'express';
import * as brandsService from '../services/brandsService.js';

export async function listBrands(_req: Request, res: Response) {
  res.json(await brandsService.listBrands());
}

export async function getBrand(req: Request, res: Response) {
  res.json(await brandsService.getBrand(Number(req.params.id)));
}

export async function listBrandModels(req: Request, res: Response) {
  res.json(await brandsService.listBrandModels(Number(req.params.brandId)));
}

export async function createBrand(req: Request, res: Response) {
  const brand = await brandsService.createBrand(req.body);
  res.status(201).json(brand);
}

export async function updateBrand(req: Request, res: Response) {
  res.json(await brandsService.updateBrand(Number(req.params.id), req.body));
}

export async function deleteBrand(req: Request, res: Response) {
  await brandsService.deleteBrand(Number(req.params.id));
  res.status(204).send();
}
