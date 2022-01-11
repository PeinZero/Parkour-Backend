import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import { addCar, deleteCar, getAllCarsByParker } from '../controllers/cars.js';

const router = Router();

// Posts
router.post('/addCar', isAuth, addCar);

// Gets
router.get('/getAllCarsByParker', isAuth, getAllCarsByParker);

// Deletes
router.delete('/deleteCar/:carId', isAuth, deleteCar);

// Dev APIs

export default router;
