import { Router } from 'express';
import {
  getBoardActivity,
  getCardActivity,
} from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/board/:boardId', getBoardActivity);
router.get('/card/:cardId', getCardActivity);

export default router;
