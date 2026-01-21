import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, slug: string, userId: string) {
    const existing = await this.prisma.workspace.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Workspace slug already exists');
    }

    const workspace = await this.prisma.workspace.create({
      data: {
        name,
        slug,
        createdBy: userId,
        users: {
          create: {
            userId,
            role: 'ADMIN',
          },
        },
        settings: {
          create: {},
        },
      },
      include: {
        users: { include: { user: true } },
        settings: true,
      },
    });

    return workspace;
  }

  async findAll(userId: string) {
    return this.prisma.workspace.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
      include: {
        users: { include: { user: true } },
        _count: {
          select: {
            projects: true,
            teams: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        users: { include: { user: true } },
        teams: { include: { members: true } },
        projects: { include: { _count: { select: { issues: true } } } },
        labels: true,
        settings: true,
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const hasAccess = workspace.users.some((u) => u.userId === userId);
    if (!hasAccess) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async update(id: string, data: any, userId: string) {
    const workspace = await this.findOne(id, userId);

    return this.prisma.workspace.update({
      where: { id },
      data,
      include: {
        users: { include: { user: true } },
        settings: true,
      },
    });
  }

  async addMember(workspaceId: string, email: string, role: string, invitedBy: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.workspaceUser.create({
      data: {
        workspaceId,
        userId: user.id,
        role: role as any,
      },
      include: {
        user: true,
      },
    });
  }

  async removeMember(workspaceId: string, userId: string) {
    await this.prisma.workspaceUser.deleteMany({
      where: {
        workspaceId,
        userId,
      },
    });

    return { message: 'Member removed successfully' };
  }
}
