import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { NotificationService } from '../services/notificationService';
import { HttpStatus } from '../utils/constants';

export class NotificationController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notifications = await NotificationService.getUserNotifications(req.user!.id);
      res.status(HttpStatus.OK).json({ notifications });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await NotificationService.markAsRead(notificationId, req.user!.id);
      
      res.status(HttpStatus.OK).json({ notification });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAllAsRead(req.user!.id);
      res.status(HttpStatus.OK).json({ message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const count = await NotificationService.getUnreadCount(req.user!.id);
      res.status(HttpStatus.OK).json({ count });
    } catch (error) {
      next(error);
    }
  }
}
