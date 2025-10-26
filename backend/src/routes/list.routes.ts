import { Router } from 'express';
import {
  createList,
  getLists,
  updateList,
  deleteList,
} from '../controllers/list.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createList);
router.get('/board/:boardId', getLists);
router.patch('/:id', updateList);
router.delete('/:id', deleteList);

export default router;
