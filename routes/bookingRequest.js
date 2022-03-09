import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import { create, get, remove } from '../controllers/bookingRequest.js';

const router = new Router();
// Posts
router.post('/', isAuth, create);

// Gets
router.get('/', isAuth, get);

// Deletes
router.delete('/:bookingRequestId', isAuth, remove);

export default router;
