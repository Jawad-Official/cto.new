import { NotificationModel } from '../models/Notification';
import { Notification, NotificationType } from '../types';
import { AppError } from '../middleware/errorHandler';
import { HttpStatus } from '../utils/constants';

export class NotificationService {
  static async createNotification(
    userId: number,
    type: NotificationType,
    message: string,
    relatedTaskId?: number
  ): Promise<Notification> {
    return NotificationModel.create(userId, type, message, relatedTaskId);
  }

  static async getUserNotifications(userId: number): Promise<Notification[]> {
    return NotificationModel.findByUserId(userId);
  }

  static async markAsRead(notificationId: number, userId: number): Promise<Notification> {
    const notification = await NotificationModel.findById(notificationId);

    if (!notification) {
      throw new AppError('Notification not found', HttpStatus.NOT_FOUND);
    }

    if (notification.user_id !== userId) {
      throw new AppError('Access denied', HttpStatus.FORBIDDEN);
    }

    const updated = await NotificationModel.markAsRead(notificationId);

    if (!updated) {
      throw new AppError('Failed to update notification', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return updated;
  }

  static async markAllAsRead(userId: number): Promise<void> {
    await NotificationModel.markAllAsRead(userId);
  }

  static async getUnreadCount(userId: number): Promise<number> {
    return NotificationModel.getUnreadCount(userId);
  }

  static async notifyTaskAssigned(userId: number, taskId: number, taskTitle: string) {
    const message = `You were assigned to task: ${taskTitle}`;
    return this.createNotification(userId, 'TASK_ASSIGNED', message, taskId);
  }

  static async notifyCommentAdded(userId: number, taskId: number, taskTitle: string, commenterName: string) {
    const message = `${commenterName} commented on task: ${taskTitle}`;
    return this.createNotification(userId, 'COMMENT_ADDED', message, taskId);
  }

  static async notifyTaskUpdated(userId: number, taskId: number, taskTitle: string) {
    const message = `Task updated: ${taskTitle}`;
    return this.createNotification(userId, 'TASK_UPDATED', message, taskId);
  }
}
