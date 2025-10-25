import { Router } from 'express';
import { register, login, refreshAccessToken, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshAccessToken);

// Protected routes
router.get('/me', authenticate, getMe);

export default router;
