import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import {registerCar, registerSpot, getAllUsers} from '../controllers/users.js';

const router = Router();

// Posts
router.post('/registerCar', isAuth, registerCar);
router.post('/registerSpot', isAuth, registerSpot);

// Gets
router.get('/all', getAllUsers);


export default router;
