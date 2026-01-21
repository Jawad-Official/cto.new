import { TaskModel } from '../models/Task';
import { ProjectModel } from '../models/Project';
import { CreateTaskDto, UpdateTaskDto, TaskFilters, Task } from '../types';
import { AppError } from '../middleware/errorHandler';
import { HttpStatus } from '../utils/constants';

export class TaskService {
  static async createTask(userId: number, data: CreateTaskDto): Promise<Task> {
    const isMember = await ProjectModel.isMember(data.project_id, userId);

    if (!isMember) {
      throw new AppError('Access denied', HttpStatus.FORBIDDEN);
    }

    const taskData = {
      project_id: data.project_id,
      title: data.title,
      description: data.description,
      status: data.status || 'TODO',
      priority: data.priority || 'MEDIUM',
      due_date: data.due_date,
      created_by: userId,
    };

    return TaskModel.create(taskData, data.assignee_ids);
  }

  static async getTaskById(taskId: number, userId: number): Promise<Task> {
    const task = await TaskModel.findById(taskId);

    if (!task) {
      throw new AppError('Task not found', HttpStatus.NOT_FOUND);
    }

    const isMember = await ProjectModel.isMember(task.project_id, userId);

    if (!isMember) {
      throw new AppError('Access denied', HttpStatus.FORBIDDEN);
    }

    return task;
  }

  static async getTasks(userId: number, filters: TaskFilters): Promise<Task[]> {
    if (filters.project_id) {
      const isMember = await ProjectModel.isMember(filters.project_id, userId);

      if (!isMember) {
        throw new AppError('Access denied', HttpStatus.FORBIDDEN);
      }
    }

    return TaskModel.findByFilters(filters);
  }

  static async updateTask(taskId: number, userId: number, data: UpdateTaskDto): Promise<Task> {
    const task = await TaskModel.findById(taskId);

    if (!task) {
      throw new AppError('Task not found', HttpStatus.NOT_FOUND);
    }

    const isMember = await ProjectModel.isMember(task.project_id, userId);

    if (!isMember) {
      throw new AppError('Access denied', HttpStatus.FORBIDDEN);
    }

    const updatedTask = await TaskModel.update(taskId, data);

    if (!updatedTask) {
      throw new AppError('Failed to update task', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return updatedTask;
  }

  static async deleteTask(taskId: number, userId: number): Promise<void> {
    const task = await TaskModel.findById(taskId);

    if (!task) {
      throw new AppError('Task not found', HttpStatus.NOT_FOUND);
    }

    const isOwner = await ProjectModel.isOwner(task.project_id, userId);

    if (!isOwner && task.created_by !== userId) {
      throw new AppError('Only task creator or project owner can delete', HttpStatus.FORBIDDEN);
    }

    await TaskModel.delete(taskId);
  }

  static async getTaskAssignees(taskId: number, userId: number) {
    const task = await TaskModel.findById(taskId);

    if (!task) {
      throw new AppError('Task not found', HttpStatus.NOT_FOUND);
    }

    const isMember = await ProjectModel.isMember(task.project_id, userId);

    if (!isMember) {
      throw new AppError('Access denied', HttpStatus.FORBIDDEN);
    }

    return TaskModel.getAssignees(taskId);
  }

  static async assignTask(taskId: number, userId: number, assigneeId: number) {
    const task = await TaskModel.findById(taskId);

    if (!task) {
      throw new AppError('Task not found', HttpStatus.NOT_FOUND);
    }

    const isMember = await ProjectModel.isMember(task.project_id, userId);

    if (!isMember) {
      throw new AppError('Access denied', HttpStatus.FORBIDDEN);
    }

    const isAssigneeMember = await ProjectModel.isMember(task.project_id, assigneeId);

    if (!isAssigneeMember) {
      throw new AppError('Assignee is not a project member', HttpStatus.BAD_REQUEST);
    }

    const assigned = await TaskModel.addAssignee(taskId, assigneeId);

    if (!assigned) {
      throw new AppError('User is already assigned', HttpStatus.CONFLICT);
    }
  }

  static async unassignTask(taskId: number, userId: number, assigneeId: number) {
    const task = await TaskModel.findById(taskId);

    if (!task) {
      throw new AppError('Task not found', HttpStatus.NOT_FOUND);
    }

    const isMember = await ProjectModel.isMember(task.project_id, userId);

    if (!isMember) {
      throw new AppError('Access denied', HttpStatus.FORBIDDEN);
    }

    const removed = await TaskModel.removeAssignee(taskId, assigneeId);

    if (!removed) {
      throw new AppError('User is not assigned to this task', HttpStatus.BAD_REQUEST);
    }
  }
}
