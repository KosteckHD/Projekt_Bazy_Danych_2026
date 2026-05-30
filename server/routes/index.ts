import { Router } from 'express';
import authRoutes from './authRoutes.js';
import branchesRoutes from './branchesRoutes.js';
import brandsRoutes from './brandsRoutes.js';
import carDamageReportsRoutes from './carDamageReportsRoutes.js';
import carServiceRecordsRoutes from './carServiceRecordsRoutes.js';
import carsRoutes from './carsRoutes.js';
import modelsRoutes from './modelsRoutes.js';
import rentsRoutes from './rentsRoutes.js';
import reportsRoutes from './reportsRoutes.js';
import transactionsRoutes from './transactionsRoutes.js';
import usersRoutes from './usersRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/branches', branchesRoutes);
router.use('/brands', brandsRoutes);
router.use('/models', modelsRoutes);
router.use('/cars', carsRoutes);
router.use('/users', usersRoutes);
router.use('/rents', rentsRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/car-service-records', carServiceRecordsRoutes);
router.use('/car-damage-reports', carDamageReportsRoutes);
router.use('/reports', reportsRoutes);

export default router;
