import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ProjectService } from '../services/projectService';
import { HttpStatus } from '../utils/constants';

export class ProjectController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      const project = await ProjectService.createProject(req.user!.id, { name, description });
      
      res.status(HttpStatus.CREATED).json({ project });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projects = await ProjectService.getUserProjects(req.user!.id);
      res.status(HttpStatus.OK).json({ projects });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      const project = await ProjectService.getProjectById(projectId, req.user!.id);
      
      res.status(HttpStatus.OK).json({ project });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      const { name, description } = req.body;
      const project = await ProjectService.updateProject(projectId, req.user!.id, { name, description });
      
      res.status(HttpStatus.OK).json({ project });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      await ProjectService.deleteProject(projectId, req.user!.id);
      
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  static async getMembers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      const members = await ProjectService.getProjectMembers(projectId, req.user!.id);
      
      res.status(HttpStatus.OK).json({ members });
    } catch (error) {
      next(error);
    }
  }

  static async addMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      const { user_id } = req.body;
      const member = await ProjectService.addMember(projectId, req.user!.id, user_id);
      
      res.status(HttpStatus.CREATED).json({ member });
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      await ProjectService.removeMember(projectId, req.user!.id, userId);
      
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}
