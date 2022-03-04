import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import {
  addSpot,
  deleteSpot,
  editSpot,
  requestSpot,
  getSpotsByRadius,
  getAllSpotsBySeller,
  getAllSpots
} from '../controllers/spots.js';

const router = Router();

// Posts
router.post('/addSpot', isAuth, addSpot);
router.delete('/deleteSpot/:spotId', isAuth, deleteSpot);

// Puts
router.put('/requestSpot/:spotId', isAuth, requestSpot);
router.put('/editSpot/:spotId', isAuth, editSpot);

// Gets
router.get('/getAllSpots', isAuth, getAllSpots);

// Dev APIs
router.get('/getAllSpotsBySeller', isAuth, getAllSpotsBySeller);
router.get('/getSpotsByRadius', isAuth, getSpotsByRadius);

export default router;
