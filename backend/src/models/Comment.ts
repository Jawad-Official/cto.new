import { query } from '../config/database';
import { Comment } from '../types';

export class CommentModel {
  static async create(taskId: number, userId: number, content: string): Promise<Comment> {
    const result = await query(
      'INSERT INTO comments (task_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [taskId, userId, content]
    );

    return result.rows[0];
  }

  static async findById(id: number): Promise<Comment | null> {
    const result = await query('SELECT * FROM comments WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByTaskId(taskId: number): Promise<any[]> {
    const result = await query(
      `SELECT c.*, u.name as user_name, u.email as user_email, u.avatar_url as user_avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.task_id = $1
       ORDER BY c.created_at ASC`,
      [taskId]
    );

    return result.rows;
  }

  static async update(id: number, content: string): Promise<Comment | null> {
    const result = await query(
      'UPDATE comments SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [content, id]
    );

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM comments WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async isOwner(commentId: number, userId: number): Promise<boolean> {
    const result = await query(
      'SELECT 1 FROM comments WHERE id = $1 AND user_id = $2',
      [commentId, userId]
    );

    return result.rows.length > 0;
  }
}
