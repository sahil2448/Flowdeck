import { Router } from 'express';
import {
  getBoardTags,
  createTag,
  updateTag,
  deleteTag,
  getCardTags,
  addTagToCard,
  removeTagFromCard,
} from '../controllers/tag.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Board tag routes
router.get('/board/:boardId', getBoardTags);
router.post('/', createTag);
router.patch('/:id', updateTag);
router.delete('/:id', deleteTag);

// Card tag routes
router.get('/card/:cardId', getCardTags);
router.post('/card/:cardId', addTagToCard);
router.delete('/card/:cardId/tag/:tagId', removeTagFromCard);

export default router;
