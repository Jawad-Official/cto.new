import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { UserModel } from '../models/User';
import { HttpStatus } from '../utils/constants';

export class UserController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await UserModel.findAll();
      res.status(HttpStatus.OK).json({ users });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id);
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'User not found' });
      }
      
      res.status(HttpStatus.OK).json({ user });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { name, avatar_url } = req.body;
      
      const user = await UserModel.update(userId, { name, avatar_url });
      
      res.status(HttpStatus.OK).json({ user });
    } catch (error) {
      next(error);
    }
  }
}
