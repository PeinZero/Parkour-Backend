import { Router } from 'express';
import {signup, login} from '../controllers/auth.js';

const router = Router();

// posts
router.post('/signup', signup);
router.post('/login', login);

// gets

export default router;
