import { UserModel } from '../models/User';
import { generateToken } from '../utils/jwt';
import { RegisterDto, LoginDto, UserResponse } from '../types';
import { AppError } from '../middleware/errorHandler';
import { HttpStatus } from '../utils/constants';

export class AuthService {
  static async register(data: RegisterDto): Promise<{ user: UserResponse; token: string }> {
    const existingUser = await UserModel.findByEmail(data.email);
    
    if (existingUser) {
      throw new AppError('User already exists', HttpStatus.CONFLICT);
    }

    const user = await UserModel.create(data.email, data.password, data.name);
    const token = generateToken({ userId: user.id, email: user.email });

    return { user, token };
  }

  static async login(data: LoginDto): Promise<{ user: UserResponse; token: string }> {
    const user = await UserModel.findByEmail(data.email);

    if (!user) {
      throw new AppError('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await UserModel.comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const { password, ...userResponse } = user;
    const token = generateToken({ userId: user.id, email: user.email });

    return { user: userResponse, token };
  }

  static async getCurrentUser(userId: number): Promise<UserResponse> {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }
}
