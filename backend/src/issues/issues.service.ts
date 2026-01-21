import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateIssueDto, UpdateIssueDto, IssueFilterDto } from './dto/issue.dto';

@Injectable()
export class IssuesService {
  constructor(private prisma: PrismaService) {}

  async create(createIssueDto: CreateIssueDto, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: createIssueDto.projectId },
      include: { issues: { orderBy: { number: 'desc' }, take: 1 } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const nextNumber = (project.issues[0]?.number || 0) + 1;

    const issue = await this.prisma.issue.create({
      data: {
        ...createIssueDto,
        creatorId: userId,
        number: nextNumber,
      },
      include: {
        project: true,
        assignee: true,
        creator: true,
        labels: { include: { label: true } },
      },
    });

    await this.prisma.activityLog.create({
      data: {
        action: 'ISSUE_CREATED',
        entityType: 'issue',
        entityId: issue.id,
        userId,
        issueId: issue.id,
        metadata: { title: issue.title },
      },
    });

    return issue;
  }

  async findAll(filters: IssueFilterDto) {
    const where: any = {};

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const issues = await this.prisma.issue.findMany({
      where,
      include: {
        project: true,
        assignee: true,
        creator: true,
        labels: { include: { label: true } },
        _count: {
          select: {
            comments: true,
            attachments: true,
            subIssues: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    });

    return issues;
  }

  async findOne(id: string, userId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
      include: {
        project: true,
        assignee: true,
        creator: true,
        cycle: true,
        labels: { include: { label: true } },
        comments: {
          include: { user: true, replies: { include: { user: true } } },
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
        subIssues: {
          include: {
            assignee: true,
            labels: { include: { label: true } },
          },
        },
        parent: true,
        outgoingRelations: {
          include: { target: { include: { project: true } } },
        },
        incomingRelations: {
          include: { source: { include: { project: true } } },
        },
        activities: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    return issue;
  }

  async update(id: string, updateIssueDto: UpdateIssueDto, userId: string) {
    const existingIssue = await this.prisma.issue.findUnique({
      where: { id },
    });

    if (!existingIssue) {
      throw new NotFoundException('Issue not found');
    }

    const issue = await this.prisma.issue.update({
      where: { id },
      data: updateIssueDto,
      include: {
        project: true,
        assignee: true,
        creator: true,
        labels: { include: { label: true } },
      },
    });

    const changes = {};
    Object.keys(updateIssueDto).forEach((key) => {
      if (existingIssue[key] !== updateIssueDto[key]) {
        changes[key] = {
          from: existingIssue[key],
          to: updateIssueDto[key],
        };
      }
    });

    await this.prisma.activityLog.create({
      data: {
        action: 'ISSUE_UPDATED',
        entityType: 'issue',
        entityId: issue.id,
        userId,
        issueId: issue.id,
        metadata: { changes },
      },
    });

    return issue;
  }

  async delete(id: string, userId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    await this.prisma.issue.delete({
      where: { id },
    });

    return { message: 'Issue deleted successfully' };
  }

  async addLabel(issueId: string, labelId: string, userId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    await this.prisma.issueLabel.create({
      data: {
        issueId,
        labelId,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        action: 'LABEL_ADDED',
        entityType: 'issue',
        entityId: issueId,
        userId,
        issueId,
        metadata: { labelId },
      },
    });

    return { message: 'Label added successfully' };
  }

  async removeLabel(issueId: string, labelId: string, userId: string) {
    await this.prisma.issueLabel.deleteMany({
      where: {
        issueId,
        labelId,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        action: 'LABEL_REMOVED',
        entityType: 'issue',
        entityId: issueId,
        userId,
        issueId,
        metadata: { labelId },
      },
    });

    return { message: 'Label removed successfully' };
  }

  async addWatcher(issueId: string, userId: string) {
    await this.prisma.issueWatcher.create({
      data: {
        issueId,
        userId,
      },
    });

    return { message: 'Watcher added successfully' };
  }

  async removeWatcher(issueId: string, userId: string) {
    await this.prisma.issueWatcher.deleteMany({
      where: {
        issueId,
        userId,
      },
    });

    return { message: 'Watcher removed successfully' };
  }
}
