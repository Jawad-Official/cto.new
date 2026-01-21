import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { AIService } from '../services/aiService';
import { HttpStatus } from '../utils/constants';

export class AIController {
  static async suggestPriority(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, description } = req.body;
      const priority = await AIService.suggestPriority(title, description);
      
      res.status(HttpStatus.OK).json({ priority });
    } catch (error) {
      next(error);
    }
  }

  static async autoAssign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { project_id } = req.body;
      const userId = await AIService.autoAssignTask(project_id);
      
      res.status(HttpStatus.OK).json({ suggested_user_id: userId });
    } catch (error) {
      next(error);
    }
  }

  static async analyzeComplexity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, description } = req.body;
      const complexity = await AIService.analyzeTaskComplexity(title, description);
      
      res.status(HttpStatus.OK).json({ complexity });
    } catch (error) {
      next(error);
    }
  }

  static async suggestDueDate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { priority, complexity } = req.body;
      const dueDate = await AIService.suggestDueDate(priority, complexity);
      
      res.status(HttpStatus.OK).json({ suggested_due_date: dueDate });
    } catch (error) {
      next(error);
    }
  }
}
