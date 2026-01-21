import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(issueId: string, createCommentDto: CreateCommentDto, userId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    const comment = await this.prisma.issueComment.create({
      data: {
        ...createCommentDto,
        issueId,
        userId,
      },
      include: {
        user: true,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        action: 'COMMENT_ADDED',
        entityType: 'comment',
        entityId: comment.id,
        userId,
        issueId,
        metadata: { content: comment.content },
      },
    });

    return comment;
  }

  async findAll(issueId: string) {
    return this.prisma.issueComment.findMany({
      where: { issueId, parentId: null },
      include: {
        user: true,
        replies: {
          include: {
            user: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(commentId: string, userId: string) {
    const comment = await this.prisma.issueComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new NotFoundException('You can only delete your own comments');
    }

    await this.prisma.issueComment.delete({
      where: { id: commentId },
    });

    return { message: 'Comment deleted successfully' };
  }
}
