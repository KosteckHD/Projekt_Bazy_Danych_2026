import type { Request, Response } from 'express';
import * as carsService from '../services/carsService.js';

export async function listCars(req: Request, res: Response) {
  res.json(await carsService.listCars(req.query));
}

export async function listAvailableCars(_req: Request, res: Response) {
  res.json(await carsService.listAvailableCars());
}

export async function getCar(req: Request, res: Response) {
  res.json(await carsService.getCar(Number(req.params.id)));
}

export async function listCarRents(req: Request, res: Response) {
  res.json(await carsService.listCarRents(Number(req.params.id)));
}

export async function createCar(req: Request, res: Response) {
  const car = await carsService.createCar(req.body);
  res.status(201).json({
    success: true,
    message: 'Samochód został pomyślnie dodany do bazy.',
    carId: car?.carId,
    modelId: car?.modelId,
    ...car,
  });
}

export async function updateCar(req: Request, res: Response) {
  res.json(await carsService.updateCar(Number(req.params.id), req.body));
}

export async function updateCarStatus(req: Request, res: Response) {
  res.json(await carsService.updateCarStatus(Number(req.params.id), req.body.status, req.user!.userId));
}

export async function deleteCar(req: Request, res: Response) {
  const result = await carsService.deleteCar(Number(req.params.id));

  if (result) {
    res.json(result);
    return;
  }

  res.status(204).send();
}
