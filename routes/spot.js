import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import {
  addSpot,
  deleteSpot,
  getSpotsByRadius,
  getAllSpotsBySeller,
  getAllSpots
} from '../controllers/spots.js';

const router = Router();

// Posts
router.post('/addSpot', isAuth, addSpot);

// Gets
router.get('/getAllSpots', isAuth, getAllSpots);

// Dev APIs
router.post('/deleteSpot/:spotId', isAuth, deleteSpot);
router.get('/getAllSpotsBySeller', isAuth, getAllSpotsBySeller);
router.get('/getSpotsByRadius', isAuth, getSpotsByRadius);

export default router;
