import { Router } from 'express';
import {
  createTag,
  getTags,
  updateTag,
  deleteTag,
  assignTagToCard,
  removeTagFromCard,
  getCardTags,
} from '../controllers/tag.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { assignTagSchema, createTagSchema } from '../validators/tag.validator';

const router = Router();

router.use(authenticate);

// Tag CRUD
router.post('/', validate(createTagSchema), createTag); // ✅ Add validation
router.get('/board/:boardId', getTags);
router.patch('/:id', updateTag);
router.delete('/:id', deleteTag);

// Tag-Card Assignment
router.post('/assign', validate(assignTagSchema), assignTagToCard); // ✅ Add validation
router.post('/unassign', validate(assignTagSchema), removeTagFromCard); // ✅ Add validation
router.get('/card/:cardId', getCardTags);

export default router;
