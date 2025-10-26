import { Router } from 'express';
import {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
} from '../controllers/board.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All board routes require authentication
router.use(authenticate);

router.post('/', createBoard);
router.get('/', getBoards);
router.get('/:id', getBoard);
router.patch('/:id', updateBoard);
router.delete('/:id', deleteBoard);

export default router;
