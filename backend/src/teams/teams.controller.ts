import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('teams')
@Controller('teams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: 'Create team' })
  create(@Body() body: any) {
    return this.teamsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all teams' })
  findAll(@Query('workspaceId') workspaceId: string) {
    return this.teamsService.findAll(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team by ID' })
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update team' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.teamsService.update(id, body);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to team' })
  addMember(@Param('id') id: string, @Body() body: { userId: string; role: string }) {
    return this.teamsService.addMember(id, body.userId, body.role);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove member from team' })
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.teamsService.removeMember(id, userId);
  }
}
