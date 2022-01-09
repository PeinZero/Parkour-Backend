import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import {registerCar} from '../controllers/cars.js';

const router = Router();

// Posts
router.post('/registerCar', isAuth, registerCar);

// Gets

// Dev APIs

export default router;