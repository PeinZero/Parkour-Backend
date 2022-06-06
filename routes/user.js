import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import {
  getAllUsers,
  switchRole,
  getUserByRole,
  rateUser,
  getAllReviews,
  updateInfo,
  getUser // dev
} from '../controllers/users.js';

const router = Router();

// Posts

// Puts
router.put('/switchRole', isAuth, switchRole);

// Patch
router.patch('/', isAuth, updateInfo);
router.patch('/review', isAuth, rateUser);

// Gets
router.get('/getUserByRole/:roleId', isAuth, getUserByRole);
router.get('/review/:specialUserId', isAuth, getAllReviews);

// Dev APIs
router.get('/all', getAllUsers);
router.get('/getUser/:userId', isAuth, getUser);
router.get('/getAllusers', getAllUsers);

export default router;
