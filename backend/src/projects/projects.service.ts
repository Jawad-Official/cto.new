import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    return this.prisma.project.create({
      data: {
        ...data,
      },
      include: {
        workspace: true,
        team: true,
      },
    });
  }

  async findAll(workspaceId: string) {
    return this.prisma.project.findMany({
      where: { workspaceId, archived: false },
      include: {
        team: true,
        _count: {
          select: { issues: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        workspace: true,
        team: { include: { members: { include: { user: true } } } },
        issues: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            assignee: true,
            labels: { include: { label: true } },
          },
        },
        views: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: string, data: any) {
    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.prisma.project.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully' };
  }
}
