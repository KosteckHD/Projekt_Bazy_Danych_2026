import type { Request, Response } from 'express';
import * as usersService from '../services/usersService.js';

export async function listUsers(_req: Request, res: Response) {
  res.json(await usersService.listUsers());
}

export async function getUser(req: Request, res: Response) {
  res.json(await usersService.getUser(Number(req.params.id)));
}

export async function listUserRents(req: Request, res: Response) {
  res.json(await usersService.listUserRents(Number(req.params.id)));
}

export async function createUser(req: Request, res: Response) {
  const user = await usersService.createUser(req.body);
  res.status(201).json(user);
}

export async function updateUser(req: Request, res: Response) {
  res.json(await usersService.updateUser(Number(req.params.id), req.body));
}

export async function updateUserRole(req: Request, res: Response) {
  res.json(await usersService.updateUserRole(Number(req.params.id), req.body.role));
}

export async function updatePassword(req: Request, res: Response) {
  res.json(await usersService.updatePassword(Number(req.params.id), req.body.password));
}

export async function deleteUser(req: Request, res: Response) {
  const result = await usersService.deleteUser(Number(req.params.id));

  if (result) {
    res.json(result);
    return;
  }

  res.status(204).send();
}
