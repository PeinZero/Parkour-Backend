import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import {registerSpot, deleteSpot} from '../controllers/spots.js';

const router = Router();

// Posts
router.post('/registerSpot', isAuth, registerSpot);

// Gets

// Dev APIs
router.post('/deleteSpot', isAuth, deleteSpot);

export default router;