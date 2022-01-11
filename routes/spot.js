import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import {registerSpot, deleteSpot, getSpotsByRadius, getAllSpotsBySeller} from '../controllers/spots.js';

const router = Router();

// Posts
router.post('/registerSpot', isAuth, registerSpot);

// Gets

// Dev APIs
router.post('/deleteSpot/:spotId', isAuth, deleteSpot);
router.get('/getAllSpotsBySeller', isAuth, getAllSpotsBySeller);
router.get('/getSpotsByRadius', isAuth, getSpotsByRadius);

export default router;