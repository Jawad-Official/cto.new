import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { TaskService } from '../services/taskService';
import { HttpStatus } from '../utils/constants';

export class TaskController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.createTask(req.user!.id, req.body);
      res.status(HttpStatus.CREATED).json({ task });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        project_id: req.query.project_id ? parseInt(req.query.project_id as string) : undefined,
        status: req.query.status as any,
        priority: req.query.priority as any,
        assignee_id: req.query.assignee_id ? parseInt(req.query.assignee_id as string) : undefined,
        created_by: req.query.created_by ? parseInt(req.query.created_by as string) : undefined,
      };

      const tasks = await TaskService.getTasks(req.user!.id, filters);
      res.status(HttpStatus.OK).json({ tasks });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const taskId = parseInt(req.params.id);
      const task = await TaskService.getTaskById(taskId, req.user!.id);
      
      res.status(HttpStatus.OK).json({ task });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const taskId = parseInt(req.params.id);
      const task = await TaskService.updateTask(taskId, req.user!.id, req.body);
      
      res.status(HttpStatus.OK).json({ task });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const taskId = parseInt(req.params.id);
      await TaskService.deleteTask(taskId, req.user!.id);
      
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  static async getAssignees(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const taskId = parseInt(req.params.id);
      const assignees = await TaskService.getTaskAssignees(taskId, req.user!.id);
      
      res.status(HttpStatus.OK).json({ assignees });
    } catch (error) {
      next(error);
    }
  }

  static async assignUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const taskId = parseInt(req.params.id);
      const { user_id } = req.body;
      await TaskService.assignTask(taskId, req.user!.id, user_id);
      
      res.status(HttpStatus.CREATED).json({ message: 'User assigned successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async unassignUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const taskId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      await TaskService.unassignTask(taskId, req.user!.id, userId);
      
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}
