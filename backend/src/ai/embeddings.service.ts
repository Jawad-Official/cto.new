import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class EmbeddingsService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateAndStoreEmbedding(issueId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      return;
    }

    const text = `${issue.title} ${issue.description || ''}`;
    const embedding = await this.generateEmbedding(text);

    if (embedding.length > 0) {
      await this.prisma.$executeRaw`
        UPDATE "Issue"
        SET embedding = ${embedding}::vector
        WHERE id = ${issueId}
      `;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text.substring(0, 8000),
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      return [];
    }
  }

  async semanticSearch(query: string, projectId: string, limit: number = 10) {
    const embedding = await this.generateEmbedding(query);

    if (embedding.length === 0) {
      return [];
    }

    const results = await this.prisma.$queryRaw`
      SELECT
        i.*,
        1 - (i.embedding <=> ${embedding}::vector) as similarity
      FROM "Issue" i
      WHERE i."projectId" = ${projectId}
        AND i.embedding IS NOT NULL
      ORDER BY similarity DESC
      LIMIT ${limit}
    `;

    return results;
  }
}
