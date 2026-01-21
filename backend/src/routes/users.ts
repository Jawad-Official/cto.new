import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);
router.put('/profile', UserController.update);

export default router;
