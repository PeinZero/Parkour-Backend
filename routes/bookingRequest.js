import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import { create, getParkerRequests, getSellerRequests, remove } from '../controllers/bookingRequest.js';

const router = new Router();
// Posts
router.post('/', isAuth, create);

// Gets
router.get('/parkerRequests', isAuth, getParkerRequests);
router.get('/sellerRequests', isAuth, getSellerRequests);

// Deletes
router.delete('/:bookingRequestId', isAuth, remove);

export default router;
