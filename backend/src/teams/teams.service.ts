import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.team.create({
      data,
      include: { workspace: true, members: { include: { user: true } } },
    });
  }

  async findAll(workspaceId: string) {
    return this.prisma.team.findMany({
      where: { workspaceId },
      include: {
        members: { include: { user: true } },
        _count: { select: { projects: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.team.findUnique({
      where: { id },
      include: {
        workspace: true,
        members: { include: { user: true } },
        projects: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.team.update({
      where: { id },
      data,
    });
  }

  async addMember(teamId: string, userId: string, role: string) {
    return this.prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role: role as any,
      },
      include: { user: true },
    });
  }

  async removeMember(teamId: string, userId: string) {
    await this.prisma.teamMember.deleteMany({
      where: { teamId, userId },
    });
    return { message: 'Member removed successfully' };
  }
}
