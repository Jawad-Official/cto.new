import { Router } from 'express';
import { body } from 'express-validator';
import { CommentController } from '../controllers/commentController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  validate([
    body('task_id').isInt().withMessage('Valid task_id is required'),
    body('content').notEmpty().withMessage('Content is required'),
  ]),
  CommentController.create
);

router.get('/task/:taskId', CommentController.getByTaskId);

router.put(
  '/:id',
  validate([
    body('content').notEmpty().withMessage('Content is required'),
  ]),
  CommentController.update
);

router.delete('/:id', CommentController.delete);

export default router;
