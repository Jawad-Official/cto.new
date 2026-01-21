import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search issues' })
  search(@Query('q') query: string, @Query('workspaceId') workspaceId: string) {
    return this.searchService.search(query, workspaceId);
  }

  @Get('semantic')
  @ApiOperation({ summary: 'Semantic search using AI' })
  semanticSearch(@Query('q') query: string, @Query('projectId') projectId: string) {
    return this.searchService.semanticSearch(query, projectId);
  }

  @Get('natural-language')
  @ApiOperation({ summary: 'Parse natural language query' })
  parseQuery(@Query('q') query: string, @Query('workspaceId') workspaceId: string) {
    return this.searchService.parseNaturalLanguageQuery(query, workspaceId);
  }
}
