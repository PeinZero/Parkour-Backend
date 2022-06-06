import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import { create, getParkerRequests, getSellerRequests, reject, accept } from '../controllers/bookingRequest.js';

const router = new Router();
// Posts
router.post('/', isAuth, create);
router.post('/accept/:bookingRequestId', isAuth, accept);

// Gets
router.get('/parkerRequests', isAuth, getParkerRequests);
router.get('/sellerRequests', isAuth, getSellerRequests);

// Deletes
router.delete('/:bookingRequestId', isAuth, reject);

export default router;
