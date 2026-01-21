import { Request } from 'express';

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export type UserRole = 'ADMIN' | 'MEMBER';

export interface UserResponse extends Omit<User, 'password'> {}

export interface Project {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: ProjectRole;
  joined_at: Date;
}

export type ProjectRole = 'OWNER' | 'MEMBER';

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: Date;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TaskAssignee {
  id: number;
  task_id: number;
  user_id: number;
  assigned_at: Date;
}

export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  message: string;
  related_task_id?: number;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}

export type NotificationType = 
  | 'TASK_ASSIGNED'
  | 'TASK_UPDATED'
  | 'TASK_DUE_SOON'
  | 'COMMENT_ADDED'
  | 'PROJECT_INVITE'
  | 'MENTION';

export interface AuthRequest extends Request {
  user?: UserResponse;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
}

export interface CreateTaskDto {
  project_id: number;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: Date;
  assignee_ids?: number[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: Date;
}

export interface CreateCommentDto {
  task_id: number;
  content: string;
}

export interface UpdateCommentDto {
  content: string;
}

export interface TaskFilters {
  project_id?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: number;
  created_by?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface JwtPayload {
  userId: number;
  email: string;
}
