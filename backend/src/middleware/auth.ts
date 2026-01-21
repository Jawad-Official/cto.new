import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../utils/jwt';
import { query } from '../config/database';
import { HttpStatus } from '../utils/constants';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        error: 'No token provided',
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const result = await query(
      'SELECT id, email, name, avatar_url, role, created_at, updated_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        error: 'User not found',
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      error: 'Invalid token',
    });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(HttpStatus.FORBIDDEN).json({
      error: 'Admin access required',
    });
  }
  next();
};
