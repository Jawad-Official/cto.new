import { query } from '../config/database';
import { User, UserResponse } from '../types';
import bcrypt from 'bcrypt';

export class UserModel {
  static async create(email: string, password: string, name: string, role: string = 'MEMBER'): Promise<UserResponse> {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, avatar_url, role, created_at, updated_at',
      [email, hashedPassword, name, role]
    );

    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<UserResponse | null> {
    const result = await query(
      'SELECT id, email, name, avatar_url, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  static async findAll(): Promise<UserResponse[]> {
    const result = await query(
      'SELECT id, email, name, avatar_url, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    return result.rows;
  }

  static async update(id: number, updates: Partial<User>): Promise<UserResponse | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    if (updates.name) {
      fields.push(`name = $${paramCounter++}`);
      values.push(updates.name);
    }

    if (updates.avatar_url) {
      fields.push(`avatar_url = $${paramCounter++}`);
      values.push(updates.avatar_url);
    }

    if (updates.role) {
      fields.push(`role = $${paramCounter++}`);
      values.push(updates.role);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING id, email, name, avatar_url, role, created_at, updated_at`,
      values
    );

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
