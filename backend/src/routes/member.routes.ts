import { Router } from 'express';
import {
  getBoardMembers,
  addCardMember,
  removeCardMember,
  getCardMembers,
} from '../controllers/member.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/board/:boardId', getBoardMembers);

router.get('/card/:cardId', getCardMembers);

router.post('/card/:cardId', addCardMember);

router.delete('/card/:cardId/user/:userId', removeCardMember);

export default router;
