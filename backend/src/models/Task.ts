import { query, getClient } from '../config/database';
import { Task, TaskFilters } from '../types';

export class TaskModel {
  static async create(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>, assigneeIds?: number[]): Promise<Task> {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO tasks (project_id, title, description, status, priority, due_date, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          taskData.project_id,
          taskData.title,
          taskData.description,
          taskData.status || 'TODO',
          taskData.priority || 'MEDIUM',
          taskData.due_date,
          taskData.created_by,
        ]
      );

      const task = result.rows[0];

      if (assigneeIds && assigneeIds.length > 0) {
        for (const userId of assigneeIds) {
          await client.query(
            'INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2)',
            [task.id, userId]
          );
        }
      }

      await client.query('COMMIT');
      return task;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id: number): Promise<Task | null> {
    const result = await query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByFilters(filters: TaskFilters): Promise<Task[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    if (filters.project_id) {
      conditions.push(`t.project_id = $${paramCounter++}`);
      values.push(filters.project_id);
    }

    if (filters.status) {
      conditions.push(`t.status = $${paramCounter++}`);
      values.push(filters.status);
    }

    if (filters.priority) {
      conditions.push(`t.priority = $${paramCounter++}`);
      values.push(filters.priority);
    }

    if (filters.created_by) {
      conditions.push(`t.created_by = $${paramCounter++}`);
      values.push(filters.created_by);
    }

    if (filters.assignee_id) {
      conditions.push(`EXISTS (
        SELECT 1 FROM task_assignees ta 
        WHERE ta.task_id = t.id AND ta.user_id = $${paramCounter++}
      )`);
      values.push(filters.assignee_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT t.* FROM tasks t ${whereClause} ORDER BY t.created_at DESC`,
      values
    );

    return result.rows;
  }

  static async update(id: number, updates: Partial<Task>): Promise<Task | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    if (updates.title) {
      fields.push(`title = $${paramCounter++}`);
      values.push(updates.title);
    }

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCounter++}`);
      values.push(updates.description);
    }

    if (updates.status) {
      fields.push(`status = $${paramCounter++}`);
      values.push(updates.status);
    }

    if (updates.priority) {
      fields.push(`priority = $${paramCounter++}`);
      values.push(updates.priority);
    }

    if (updates.due_date !== undefined) {
      fields.push(`due_date = $${paramCounter++}`);
      values.push(updates.due_date);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM tasks WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async getAssignees(taskId: number): Promise<any[]> {
    const result = await query(
      `SELECT u.id, u.email, u.name, u.avatar_url, ta.assigned_at
       FROM users u
       JOIN task_assignees ta ON u.id = ta.user_id
       WHERE ta.task_id = $1
       ORDER BY ta.assigned_at ASC`,
      [taskId]
    );

    return result.rows;
  }

  static async addAssignee(taskId: number, userId: number): Promise<boolean> {
    try {
      await query(
        'INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2)',
        [taskId, userId]
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  static async removeAssignee(taskId: number, userId: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM task_assignees WHERE task_id = $1 AND user_id = $2',
      [taskId, userId]
    );

    return (result.rowCount ?? 0) > 0;
  }

  static async getTasksByProjectId(projectId: number): Promise<Task[]> {
    const result = await query(
      'SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );

    return result.rows;
  }

  static async getUserTaskCount(userId: number): Promise<number> {
    const result = await query(
      `SELECT COUNT(*) as count FROM task_assignees WHERE user_id = $1`,
      [userId]
    );

    return parseInt(result.rows[0].count);
  }
}
