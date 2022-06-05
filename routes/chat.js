import { Router } from 'express';
import {
  createChat,
  getChat,
  getChatsById,
  updateChat,
  deleteChat
} from '../controllers/chat.js';
import isAuth from '../middleware/isAuth.js';
import isUser from '../middleware/isUser.js';

const router = Router();

router.post('/', [isAuth, isUser], createChat);
router.get('/', [isAuth, isUser], getChatsById);
router.get('/:chatId', [isAuth, isUser], getChat);
router.put('/', [isAuth, isUser], updateChat);
router.delete('/', [isAuth, isUser], deleteChat);

export default router;
