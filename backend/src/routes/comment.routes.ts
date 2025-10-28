import { Router } from 'express';
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCommentSchema, updateCommentSchema } from '../validators/comment.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createCommentSchema), createComment); // ✅ Add validation
router.get('/card/:cardId', getComments);
router.patch('/:id', validate(updateCommentSchema), updateComment); // ✅ Add validation
router.delete('/:id', deleteComment);

export default router;
