import { Router } from 'express';
import authRoutes from './auth';
import projectRoutes from './projects';
import taskRoutes from './tasks';
import commentRoutes from './comments';
import userRoutes from './users';
import notificationRoutes from './notifications';
import aiRoutes from './ai';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/comments', commentRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);

export default router;
