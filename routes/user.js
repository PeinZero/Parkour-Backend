import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import {
  getAllUsers,
  switchRole,
  getUserByRole,
  getUser // dev
} from '../controllers/users.js';

const router = Router();

// Posts

// Puts
router.put('/switchRole', isAuth, switchRole);

// Gets
router.get('/getUserByRole/:roleId', isAuth, getUserByRole);

// Dev APIs
router.get('/all', getAllUsers);
router.get('/getUser/:userId', isAuth, getUser);
router.get('/getAllusers', getAllUsers);

export default router;
