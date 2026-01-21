import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AiService {
  private httpClient: AxiosInstance;
  private openrouterApiKey: string;
  private apiBaseUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.openrouterApiKey = this.configService.get<string>('OPENROUTER_API_KEY') || '';
    this.apiBaseUrl = 'https://api.openrouter.ai/api/v1';
    this.httpClient = axios.create({
      baseURL: this.apiBaseUrl,
      headers: {
        'Authorization': `Bearer ${this.openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://linear-clone.com',
        'X-Title': 'Linear Clone',
      },
    });
  }

  async generateIssueDetails(title: string, workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        labels: true,
        projects: { include: { issues: { take: 10, orderBy: { createdAt: 'desc' } } } },
      },
    });

    const recentIssues = workspace.projects
      .flatMap((p) => p.issues)
      .map((i) => ({ title: i.title, description: i.description }))
      .slice(0, 5);

    const availableLabels = workspace.labels.map((l) => l.name);

    const prompt = `You are an AI assistant helping to create detailed issue descriptions for a project management tool similar to Linear.

Given the issue title: "${title}"

Context from recent issues in the workspace:
${recentIssues.map((i) => `- ${i.title}`).join('\n')}

Available labels: ${availableLabels.join(', ')}

Please generate:
1. A detailed description with proper markdown formatting
2. Acceptance criteria (checklist items)
3. Suggested priority (URGENT, HIGH, MEDIUM, LOW, NONE)
4. Suggested labels from the available labels (pick 1-3 relevant ones)
5. Estimated story points (1-13)
6. Suggested subtasks (3-5 items)

Return the response as valid JSON with this structure:
{
  "description": "string with markdown",
  "acceptanceCriteria": ["criterion 1", "criterion 2", ...],
  "priority": "HIGH",
  "labels": ["label1", "label2"],
  "estimate": 5,
  "subtasks": ["subtask 1", "subtask 2", ...]
}`;

    try {
      const response = await this.httpClient.post('/chat/completions', {
        model: 'openai/gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that generates detailed issue specifications. Always respond with valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.data.choices[0].message.content;
      const parsedContent = JSON.parse(content);

      return {
        ...parsedContent,
        aiGenerated: true,
        confidence: 0.85,
      };
    } catch (error) {
      console.error('OpenRouter API error:', error);
      return this.generateFallbackIssueDetails(title);
    }
  }

  async categorizeIssue(title: string, description: string, workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        labels: true,
        users: { include: { user: true } },
        projects: { include: { issues: { take: 20 } } },
      },
    });

    const recentIssues = workspace.projects
      .flatMap((p) => p.issues)
      .slice(0, 10);

    const patterns = this.analyzePatterns(recentIssues);
    const labels = workspace.labels.map((l) => l.name);

    const prompt = `Analyze this issue and suggest categorization:

Title: ${title}
Description: ${description}

Available labels: ${labels.join(', ')}

Based on similar issues in the workspace, suggest:
1. Priority (URGENT, HIGH, MEDIUM, LOW, NONE)
2. Most relevant labels (pick 1-3)
3. Estimated story points (1-13)

Return as JSON:
{
  "priority": "HIGH",
  "labels": ["backend", "api"],
  "estimate": 5,
  "confidence": 0.9
}`;

    try {
      const response = await this.httpClient.post('/chat/completions', {
        model: 'openai/gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert at categorizing software issues.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 200,
      });

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Categorization error:', error);
      return this.generateFallbackCategorization();
    }
  }

  async detectDuplicates(title: string, description: string, projectId: string) {
    try {
      const embedding = await this.generateEmbedding(`${title} ${description}`);

      const issues = await this.prisma.$queryRaw`
        SELECT id, title, description,
               1 - (embedding <=> ${embedding}::vector) as similarity
        FROM "Issue"
        WHERE "projectId" = ${projectId}
          AND embedding IS NOT NULL
        ORDER BY similarity DESC
        LIMIT 5
      `;

      return issues.filter((issue: any) => issue.similarity > 0.8);
    } catch (error) {
      console.error('Duplicate detection error:', error);
      return [];
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.httpClient.post('/embeddings', {
        model: 'openai/text-embedding-ada-002',
        input: text,
      });

      return response.data.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      return [];
    }
  }

  private generateFallbackIssueDetails(title: string) {
    return {
      description: `## Description\n\n${title}\n\n## Requirements\n\n- To be defined\n\n## Acceptance Criteria\n\n- [ ] Feature is implemented\n- [ ] Tests are passing`,
      acceptanceCriteria: ['Feature is implemented', 'Tests are passing'],
      priority: 'MEDIUM',
      labels: [],
      estimate: 3,
      subtasks: [],
      aiGenerated: true,
      confidence: 0.5,
    };
  }

  private generateFallbackCategorization() {
    return {
      priority: 'MEDIUM',
      labels: [],
      estimate: 3,
      confidence: 0.3,
    };
  }

  private analyzePatterns(issues: any[]) {
    const priorities = issues.map((i) => i.priority);
    const estimates = issues.map((i) => i.estimate).filter((e) => e);

    return {
      commonPriority: this.mostCommon(priorities),
      avgEstimate: estimates.length ? Math.round(estimates.reduce((a, b) => a + b, 0) / estimates.length) : 3,
    };
  }

  private mostCommon(arr: any[]) {
    const counts = {};
    arr.forEach((item) => {
      counts[item] = (counts[item] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
  }
}
