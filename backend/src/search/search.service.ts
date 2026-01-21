import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmbeddingsService } from '../ai/embeddings.service';

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    private embeddingsService: EmbeddingsService,
  ) {}

  async search(query: string, workspaceId: string, filters: any = {}) {
    const where: any = {
      project: {
        workspaceId,
      },
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
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

    const issues = await this.prisma.issue.findMany({
      where,
      include: {
        project: true,
        assignee: true,
        creator: true,
        labels: { include: { label: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      results: issues,
      count: issues.length,
    };
  }

  async semanticSearch(query: string, projectId: string) {
    const results = await this.embeddingsService.semanticSearch(query, projectId);

    return {
      results,
      count: results.length,
    };
  }

  async parseNaturalLanguageQuery(query: string, workspaceId: string) {
    const filters: any = {};

    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('urgent') || lowerQuery.includes('critical')) {
      filters.priority = 'URGENT';
    } else if (lowerQuery.includes('high priority')) {
      filters.priority = 'HIGH';
    }

    if (lowerQuery.includes('bug') || lowerQuery.includes('bugs')) {
      filters.labelName = 'bug';
    }

    if (lowerQuery.includes('my issues') || lowerQuery.includes('assigned to me')) {
      filters.assignedToCurrentUser = true;
    }

    if (lowerQuery.includes('todo') || lowerQuery.includes('to do')) {
      filters.status = 'TODO';
    } else if (lowerQuery.includes('in progress')) {
      filters.status = 'IN_PROGRESS';
    } else if (lowerQuery.includes('done')) {
      filters.status = 'DONE';
    }

    return filters;
  }
}
