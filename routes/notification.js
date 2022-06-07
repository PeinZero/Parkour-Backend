import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import { get } from '../controllers/notification.js';

const router = Router();

router.get('/', isAuth, get);

export default router;
