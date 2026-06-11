import type { Request, Response } from 'express';
import * as authService from '../services/authService.js';
import * as usersService from '../services/usersService.js';

export async function register(req: Request, res: Response) {
  const user = await usersService.createUser({ ...req.body, role: req.body.role ?? 'Customer' });
  const session = await authService.login(req.body.email, req.body.password);
  res.status(201).json({ user, token: session.token });
}

export async function login(req: Request, res: Response) {
  res.json(await authService.login(req.body.email, req.body.password));
}
