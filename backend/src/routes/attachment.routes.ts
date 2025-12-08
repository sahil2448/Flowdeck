import { Router } from 'express';
import {
  uploadAttachment,
  getCardAttachments,
  deleteAttachment,
} from '../controllers/attachment.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../config/upload';

const router = Router();

router.use(authenticate);

router.post('/card/:cardId', upload.single('file'), uploadAttachment);

router.get('/card/:cardId', getCardAttachments);

router.delete('/:id', deleteAttachment);

export default router;
