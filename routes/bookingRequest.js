import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import { create, getAll, remove } from '../controllers/bookingRequest.js';

const router = new Router();
// Posts
router.post('/', isAuth, create);

// Gets
router.get('/', isAuth, getAll);

// Deletes
router.delete('/:bookingRequestId', isAuth, remove);

export default router;
