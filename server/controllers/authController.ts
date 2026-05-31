import type { Request, Response } from 'express';
import * as usersService from '../services/usersService.js';

export async function register(req: Request, res: Response) {
  const user = await usersService.createUser({ ...req.body, role: req.body.role ?? 'Customer' });
  res.status(201).json(user);
}
