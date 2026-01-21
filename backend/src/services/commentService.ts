import { CommentModel } from '../models/Comment';
import { TaskModel } from '../models/Task';
import { ProjectModel } from '../models/Project';
import { CreateCommentDto, UpdateCommentDto, Comment } from '../types';
import { AppError } from '../middleware/errorHandler';
import { HttpStatus } from '../utils/constants';

export class CommentService {
  static async createComment(userId: number, data: CreateCommentDto): Promise<Comment> {
    const task = await TaskModel.findById(data.task_id);

    if (!task) {
      throw new AppError('Task not found', HttpStatus.NOT_FOUND);
    }

    const isMember = await ProjectModel.isMember(task.project_id, userId);

    if (!isMember) {
      throw new AppError('Access denied', HttpStatus.FORBIDDEN);
    }

    return CommentModel.create(data.task_id, userId, data.content);
  }

  static async getCommentsByTaskId(taskId: number, userId: number) {
    const task = await TaskModel.findById(taskId);

    if (!task) {
      throw new AppError('Task not found', HttpStatus.NOT_FOUND);
    }

    const isMember = await ProjectModel.isMember(task.project_id, userId);

    if (!isMember) {
      throw new AppError('Access denied', HttpStatus.FORBIDDEN);
    }

    return CommentModel.findByTaskId(taskId);
  }

  static async updateComment(commentId: number, userId: number, data: UpdateCommentDto): Promise<Comment> {
    const comment = await CommentModel.findById(commentId);

    if (!comment) {
      throw new AppError('Comment not found', HttpStatus.NOT_FOUND);
    }

    const isOwner = await CommentModel.isOwner(commentId, userId);

    if (!isOwner) {
      throw new AppError('Only comment owner can update', HttpStatus.FORBIDDEN);
    }

    const updatedComment = await CommentModel.update(commentId, data.content);

    if (!updatedComment) {
      throw new AppError('Failed to update comment', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return updatedComment;
  }

  static async deleteComment(commentId: number, userId: number): Promise<void> {
    const comment = await CommentModel.findById(commentId);

    if (!comment) {
      throw new AppError('Comment not found', HttpStatus.NOT_FOUND);
    }

    const isOwner = await CommentModel.isOwner(commentId, userId);

    if (!isOwner) {
      throw new AppError('Only comment owner can delete', HttpStatus.FORBIDDEN);
    }

    await CommentModel.delete(commentId);
  }
}
