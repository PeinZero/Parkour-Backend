import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import { addCar, deleteCar } from '../controllers/cars.js';

const router = Router();

// Posts
router.post('/addCar', isAuth, addCar);

// Gets

// Deletes
router.delete('/deleteCar/:carId', isAuth, deleteCar);

// Dev APIs

export default router;
