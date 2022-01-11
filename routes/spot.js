import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import {registerSpot, deleteSpot} from '../controllers/spots.js';

const router = Router();

// Posts
router.post('/registerSpot', isAuth, registerSpot);

// Gets

// Dev APIs
router.post('/deleteSpot/:spotId', isAuth, deleteSpot);
// router.get('/getAllSpots', isAuth, getAllSpots);

export default router;