import { Router } from 'express';
import {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
} from '../controllers/board.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBoardSchema, updateBoardSchema } from '../validators/board.validator';

const router = Router();

// All board routes require authentication
router.use(authenticate);

router.post('/', validate(createBoardSchema), createBoard); // ✅ Add validation
router.get('/', getBoards);
router.get('/:id', getBoard);
router.patch('/:id', validate(updateBoardSchema), updateBoard); // ✅ Add validation
router.delete('/:id', deleteBoard);

export default router;
