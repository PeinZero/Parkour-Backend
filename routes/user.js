import { Router } from 'express';
import isAuth from '../middleware/isAuth.js';
import {getAllUsers, getUser, switchRole} from '../controllers/users.js';

const router = Router();

// Posts


// Puts
router.put('/switchRole', isAuth, switchRole);

// Gets

// Dev APIs
<<<<<<< HEAD
router.post('/deleteSpot', isAuth, deleteSpot);
router.get('/getUser/:userId', isAuth, getUser);

=======
router.get('/all', getAllUsers);
router.get('/getUser/:userId', isAuth, getUser);
>>>>>>> 309fae4c4984d3b278ccd5900e2601b9832ce390
router.get("/getAllusers", getAllUsers);

export default router;