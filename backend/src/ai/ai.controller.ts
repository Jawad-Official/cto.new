import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('generate-issue')
  @ApiOperation({ summary: 'Generate issue details from title using AI' })
  async generateIssue(@Body() body: { title: string; workspaceId: string }) {
    return this.aiService.generateIssueDetails(body.title, body.workspaceId);
  }

  @Post('categorize')
  @ApiOperation({ summary: 'Auto-categorize issue using AI' })
  async categorize(
    @Body() body: { title: string; description: string; workspaceId: string },
  ) {
    return this.aiService.categorizeIssue(body.title, body.description, body.workspaceId);
  }

  @Post('detect-duplicates')
  @ApiOperation({ summary: 'Detect duplicate issues using AI' })
  async detectDuplicates(
    @Body() body: { title: string; description: string; projectId: string },
  ) {
    return this.aiService.detectDuplicates(body.title, body.description, body.projectId);
  }
}
