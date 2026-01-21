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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LabelsService } from './labels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('labels')
@Controller('labels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LabelsController {
  constructor(private labelsService: LabelsService) {}

  @Post()
  create(@Body() body: any) {
    return this.labelsService.create(body);
  }

  @Get()
  findAll(@Query('workspaceId') workspaceId: string) {
    return this.labelsService.findAll(workspaceId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.labelsService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.labelsService.delete(id);
  }
}
