import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('workspaces')
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create workspace' })
  create(@Body() body: { name: string; slug: string }, @Request() req) {
    return this.workspacesService.create(body.name, body.slug, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workspaces for user' })
  findAll(@Request() req) {
    return this.workspacesService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.workspacesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workspace' })
  update(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.workspacesService.update(id, body, req.user.userId);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to workspace' })
  addMember(
    @Param('id') id: string,
    @Body() body: { email: string; role: string },
    @Request() req,
  ) {
    return this.workspacesService.addMember(id, body.email, body.role, req.user.userId);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove member from workspace' })
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.workspacesService.removeMember(id, userId);
  }
}
