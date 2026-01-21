import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';

interface AuthSocket extends Socket {
  userId?: number;
}

export const setupSocketHandlers = (io: Server) => {
  io.use((socket: AuthSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyToken(token);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    logger.info('Client connected', { socketId: socket.id, userId: socket.userId });

    socket.on('join_project', (projectId: number) => {
      const room = `project_${projectId}`;
      socket.join(room);
      logger.info('User joined project room', { userId: socket.userId, projectId, room });
    });

    socket.on('leave_project', (projectId: number) => {
      const room = `project_${projectId}`;
      socket.leave(room);
      logger.info('User left project room', { userId: socket.userId, projectId, room });
    });

    socket.on('disconnect', () => {
      logger.info('Client disconnected', { socketId: socket.id, userId: socket.userId });
    });
  });

  return io;
};

export const emitTaskCreated = (io: Server, projectId: number, task: any) => {
  io.to(`project_${projectId}`).emit('task_created', task);
};

export const emitTaskUpdated = (io: Server, projectId: number, task: any) => {
  io.to(`project_${projectId}`).emit('task_updated', task);
};

export const emitTaskDeleted = (io: Server, projectId: number, taskId: number) => {
  io.to(`project_${projectId}`).emit('task_deleted', { taskId });
};

export const emitCommentAdded = (io: Server, projectId: number, comment: any) => {
  io.to(`project_${projectId}`).emit('comment_added', comment);
};

export const emitNotification = (io: Server, userId: number, notification: any) => {
  io.to(`user_${userId}`).emit('notification', notification);
};
