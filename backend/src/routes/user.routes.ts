import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { updateProfile, changePassword } from '../controllers/user.controller';

const router = Router();

// Protected User Routes
router.patch('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);

export default router;
