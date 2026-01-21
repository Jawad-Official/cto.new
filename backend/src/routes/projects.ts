import { Router } from 'express';
import { body } from 'express-validator';
import { ProjectController } from '../controllers/projectController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  validate([
    body('name').notEmpty().withMessage('Name is required'),
  ]),
  ProjectController.create
);

router.get('/', ProjectController.getAll);
router.get('/:id', ProjectController.getById);

router.put(
  '/:id',
  validate([
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  ]),
  ProjectController.update
);

router.delete('/:id', ProjectController.delete);

router.get('/:id/members', ProjectController.getMembers);

router.post(
  '/:id/members',
  validate([
    body('user_id').isInt().withMessage('Valid user_id is required'),
  ]),
  ProjectController.addMember
);

router.delete('/:id/members/:userId', ProjectController.removeMember);

export default router;
