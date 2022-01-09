import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import {getAllUsers, getUser, switchRole} from '../controllers/users.js';

const router = Router();

// Posts


// Puts
router.put('/switchRole', isAuth, switchRole);

// Gets

// Dev APIs
router.get('/all', getAllUsers);
router.get('/getUser/:userId', isAuth, getUser);
router.get("/getAllusers", getAllUsers);

export default router;