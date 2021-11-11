import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import { registerSpot } from '../controllers/spots.js';

const router = Router();

// Posts
router.post('/registerSpot', isAuth, registerSpot);

export default router;
