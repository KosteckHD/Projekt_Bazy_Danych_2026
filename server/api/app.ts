import cors from 'cors';
import express from 'express';
import { errorHandler } from '../handlers/errorHandler.js';
import { HttpError } from '../handlers/httpError.js';
import apiRoutes from '../routes/index.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.json({
      message: 'Car rental API works',
      architecture: ['routes', 'controllers', 'services', 'handlers', 'middleware'],
      endpoints: [
        '/auth/register',
        '/branches',
        '/brands',
        '/models',
        '/cars',
        '/users',
        '/rents',
        '/transactions',
        '/car-service-records',
        '/car-damage-reports',
        '/reports',
      ],
    });
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(apiRoutes);

  app.use((_req, _res, next) => {
    next(new HttpError(404, 'Route not found'));
  });

  app.use(errorHandler);

  return app;
}
