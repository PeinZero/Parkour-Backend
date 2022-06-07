import { Router } from 'express';

import {createWallet, getCredit, addCredit} from '../controllers/transaction.js';
import isAuth from '../middleware/isAuth.js';
import isUser from '../middleware/isUser.js';

const router = Router();

router.post('/', [isAuth, isUser], createWallet);
router.get('/', [isAuth, isUser], getCredit);
router.put('/', [isAuth, isUser], addCredit);

export default router;