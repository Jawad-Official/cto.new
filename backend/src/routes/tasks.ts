import { Router } from 'express';
import { body } from 'express-validator';
import { TaskController } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  validate([
    body('project_id').isInt().withMessage('Valid project_id is required'),
    body('title').notEmpty().withMessage('Title is required'),
  ]),
  TaskController.create
);

router.get('/', TaskController.getAll);
router.get('/:id', TaskController.getById);

router.put('/:id', TaskController.update);
router.delete('/:id', TaskController.delete);

router.get('/:id/assignees', TaskController.getAssignees);

router.post(
  '/:id/assignees',
  validate([
    body('user_id').isInt().withMessage('Valid user_id is required'),
  ]),
  TaskController.assignUser
);

router.delete('/:id/assignees/:userId', TaskController.unassignUser);

export default router;
