import { Router } from 'express';
import {
  createCard,
  getCards,
  getCard,
  updateCard,
  deleteCard,
} from '../controllers/card.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCardSchema, updateCardSchema } from '../validators/card.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createCardSchema), createCard); // ✅ Add validation
router.get('/list/:listId', getCards);
router.get('/:id', getCard);
router.patch('/:id', validate(updateCardSchema), updateCard); // ✅ Add validation
router.delete('/:id', deleteCard);

export default router;
