import { query, getClient } from '../config/database';
import { Project, ProjectMember } from '../types';

export class ProjectModel {
  static async create(name: string, description: string | undefined, ownerId: number): Promise<Project> {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      const projectResult = await client.query(
        'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
        [name, description, ownerId]
      );

      const project = projectResult.rows[0];

      await client.query(
        'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
        [project.id, ownerId, 'OWNER']
      );

      await client.query('COMMIT');
      return project;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id: number): Promise<Project | null> {
    const result = await query('SELECT * FROM projects WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId: number): Promise<Project[]> {
    const result = await query(
      `SELECT DISTINCT p.* FROM projects p
       LEFT JOIN project_members pm ON p.id = pm.project_id
       WHERE p.owner_id = $1 OR pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    return result.rows;
  }

  static async update(id: number, updates: Partial<Project>): Promise<Project | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    if (updates.name) {
      fields.push(`name = $${paramCounter++}`);
      values.push(updates.name);
    }

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCounter++}`);
      values.push(updates.description);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM projects WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async getMembers(projectId: number): Promise<any[]> {
    const result = await query(
      `SELECT u.id, u.email, u.name, u.avatar_url, pm.role, pm.joined_at
       FROM users u
       JOIN project_members pm ON u.id = pm.user_id
       WHERE pm.project_id = $1
       ORDER BY pm.joined_at ASC`,
      [projectId]
    );

    return result.rows;
  }

  static async addMember(projectId: number, userId: number, role: string = 'MEMBER'): Promise<ProjectMember> {
    const result = await query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
      [projectId, userId, role]
    );

    return result.rows[0];
  }

  static async removeMember(projectId: number, userId: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 AND role != $3',
      [projectId, userId, 'OWNER']
    );

    return (result.rowCount ?? 0) > 0;
  }

  static async isMember(projectId: number, userId: number): Promise<boolean> {
    const result = await query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    return result.rows.length > 0;
  }

  static async isOwner(projectId: number, userId: number): Promise<boolean> {
    const result = await query(
      'SELECT 1 FROM projects WHERE id = $1 AND owner_id = $2',
      [projectId, userId]
    );

    return result.rows.length > 0;
  }
}
