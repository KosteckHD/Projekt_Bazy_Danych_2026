import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import * as carsService from '../services/carsService.js';

export async function uploadImage(req: Request, res: Response) {
  const { fileName, base64Data } = req.body;
  if (!base64Data) {
    res.status(400).json({ success: false, message: 'Brak danych pliku.' });
    return;
  }

  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    res.status(400).json({ success: false, message: 'Niepoprawny format Base64.' });
    return;
  }

  const buffer = Buffer.from(matches[2], 'base64');
  const ext = path.extname(fileName || 'image.jpg') || '.jpg';
  const uniqueName = `car-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

  try {
    fs.mkdirSync('uploads', { recursive: true });
    const filePath = path.join('uploads', uniqueName);
    fs.writeFileSync(filePath, buffer);

    const host = req.get('host');
    const protocol = req.protocol;
    const imageUrl = `${protocol}://${host}/uploads/${uniqueName}`;

    res.json({
      success: true,
      imageUrl
    });
  } catch (err) {
    console.error('File write error:', err);
    res.status(500).json({ success: false, message: 'Błąd podczas zapisywania pliku na serwerze.' });
  }
}

export async function listCars(req: Request, res: Response) {
  res.json(await carsService.listCars(req.query));
}

export async function listAvailableCars(_req: Request, res: Response) {
  res.json(await carsService.listAvailableCars());
}

export async function listPopularCars(_req: Request, res: Response) {
  res.json(await carsService.listPopularCars());
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
