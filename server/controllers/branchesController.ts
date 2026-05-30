import type { Request, Response } from 'express';
import * as branchesService from '../services/branchesService.js';

export async function listBranches(_req: Request, res: Response) {
  res.json(await branchesService.listBranches());
}

export async function getBranch(req: Request, res: Response) {
  res.json(await branchesService.getBranch(Number(req.params.id)));
}

export async function listBranchCars(req: Request, res: Response) {
  res.json(await branchesService.listBranchCars(Number(req.params.id)));
}

export async function createBranch(req: Request, res: Response) {
  const branch = await branchesService.createBranch(req.body);
  res.status(201).json(branch);
}

export async function updateBranch(req: Request, res: Response) {
  res.json(await branchesService.updateBranch(Number(req.params.id), req.body));
}

export async function deleteBranch(req: Request, res: Response) {
  const result = await branchesService.deleteBranch(Number(req.params.id));

  if (result) {
    res.json(result);
    return;
  }

  res.status(204).send();
}
