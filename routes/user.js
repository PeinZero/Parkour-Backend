import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import {registerCar, registerSpot, getAllUsers, deleteSpot, getUser} from '../controllers/users.js';

const router = Router();

// Posts
router.post('/registerCar', isAuth, registerCar);
router.post('/registerSpot', isAuth, registerSpot);

// Gets
router.get('/all', getAllUsers);

// Dev APIs
router.post('/deleteSpot', isAuth, deleteSpot);
router.get('/getUser/:userId', isAuth, getUser);

router.get('/getUser/:userId', isAuth, getUser);
router.get("/getAllusers", getAllUsers);

export default router;