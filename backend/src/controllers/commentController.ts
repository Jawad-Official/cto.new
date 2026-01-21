import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { CommentService } from '../services/commentService';
import { HttpStatus } from '../utils/constants';

export class CommentController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await CommentService.createComment(req.user!.id, req.body);
      res.status(HttpStatus.CREATED).json({ comment });
    } catch (error) {
      next(error);
    }
  }

  static async getByTaskId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const taskId = parseInt(req.params.taskId);
      const comments = await CommentService.getCommentsByTaskId(taskId, req.user!.id);
      
      res.status(HttpStatus.OK).json({ comments });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const commentId = parseInt(req.params.id);
      const comment = await CommentService.updateComment(commentId, req.user!.id, req.body);
      
      res.status(HttpStatus.OK).json({ comment });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const commentId = parseInt(req.params.id);
      await CommentService.deleteComment(commentId, req.user!.id);
      
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}
