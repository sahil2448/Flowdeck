import { Router } from 'express';
import {
  createList,
  getLists,
  updateList,
  deleteList,
  getListById
} from '../controllers/list.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createListSchema, updateListSchema } from '../validators/list.validator';


const router = Router();

router.use(authenticate);

router.get('/:id', getListById);
router.post('/', validate(createListSchema), createList);
router.get('/board/:boardId', getLists);
router.patch('/:id', validate(updateListSchema), updateList);
router.delete('/:id', deleteList);

export default router;
