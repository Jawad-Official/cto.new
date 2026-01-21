import { query } from '../config/database';
import { Notification, NotificationType } from '../types';

export class NotificationModel {
  static async create(
    userId: number,
    type: NotificationType,
    message: string,
    relatedTaskId?: number
  ): Promise<Notification> {
    const result = await query(
      'INSERT INTO notifications (user_id, type, message, related_task_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, type, message, relatedTaskId]
    );

    return result.rows[0];
  }

  static async findById(id: number): Promise<Notification | null> {
    const result = await query('SELECT * FROM notifications WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId: number, limit: number = 50): Promise<Notification[]> {
    const result = await query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );

    return result.rows;
  }

  static async markAsRead(id: number): Promise<Notification | null> {
    const result = await query(
      'UPDATE notifications SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    return result.rows[0] || null;
  }

  static async markAllAsRead(userId: number): Promise<boolean> {
    const result = await query(
      'UPDATE notifications SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    return (result.rowCount ?? 0) > 0;
  }

  static async getUnreadCount(userId: number): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    return parseInt(result.rows[0].count);
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM notifications WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
