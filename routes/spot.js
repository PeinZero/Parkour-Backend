import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import {
  add,
  remove,
  edit,
  getSpotsByRadius,
  getSpotsBySeller,
  switchStatus
} from '../controllers/spots.js';

const router = Router();

// Posts
router.post('/', isAuth, add);

// Gets
router.get('/getSpotsBySeller', isAuth, getSpotsBySeller);
router.get('/getSpotsByRadius', isAuth, getSpotsByRadius);

// Puts
router.put('/:spotId', isAuth, edit);
router.put('/switchStatus/:spotId', isAuth, switchStatus);

// Deletes
router.delete('/:spotId', isAuth, remove);

// Dev APIs

export default router;
