import { Router } from 'express';
import { body } from 'express-validator';
import { AIController } from '../controllers/aiController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.post(
  '/suggest-priority',
  validate([
    body('title').notEmpty().withMessage('Title is required'),
  ]),
  AIController.suggestPriority
);

router.post(
  '/auto-assign',
  validate([
    body('project_id').isInt().withMessage('Valid project_id is required'),
  ]),
  AIController.autoAssign
);

router.post(
  '/analyze-complexity',
  validate([
    body('title').notEmpty().withMessage('Title is required'),
  ]),
  AIController.analyzeComplexity
);

router.post(
  '/suggest-due-date',
  validate([
    body('priority').notEmpty().withMessage('Priority is required'),
    body('complexity').notEmpty().withMessage('Complexity is required'),
  ]),
  AIController.suggestDueDate
);

export default router;
