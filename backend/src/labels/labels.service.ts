import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class LabelsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.label.create({ data });
  }

  async findAll(workspaceId: string) {
    return this.prisma.label.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.label.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.prisma.label.delete({ where: { id } });
    return { message: 'Label deleted' };
  }
}
