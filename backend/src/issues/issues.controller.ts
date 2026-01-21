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
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { IssuesService } from './issues.service';
import { CommentsService } from './comments.service';
import { CreateIssueDto, UpdateIssueDto, IssueFilterDto } from './dto/issue.dto';
import { CreateCommentDto } from './dto/comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StorageService } from '../storage/storage.service';

@ApiTags('issues')
@Controller('issues')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IssuesController {
  constructor(
    private issuesService: IssuesService,
    private commentsService: CommentsService,
    private storageService: StorageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new issue' })
  create(@Body() createIssueDto: CreateIssueDto, @Request() req) {
    return this.issuesService.create(createIssueDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all issues with filters' })
  findAll(@Query() filters: IssueFilterDto) {
    return this.issuesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get issue by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.issuesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an issue' })
  update(
    @Param('id') id: string,
    @Body() updateIssueDto: UpdateIssueDto,
    @Request() req,
  ) {
    return this.issuesService.update(id, updateIssueDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an issue' })
  delete(@Param('id') id: string, @Request() req) {
    return this.issuesService.delete(id, req.user.userId);
  }

  @Post(':id/labels/:labelId')
  @ApiOperation({ summary: 'Add label to issue' })
  addLabel(
    @Param('id') id: string,
    @Param('labelId') labelId: string,
    @Request() req,
  ) {
    return this.issuesService.addLabel(id, labelId, req.user.userId);
  }

  @Delete(':id/labels/:labelId')
  @ApiOperation({ summary: 'Remove label from issue' })
  removeLabel(
    @Param('id') id: string,
    @Param('labelId') labelId: string,
    @Request() req,
  ) {
    return this.issuesService.removeLabel(id, labelId, req.user.userId);
  }

  @Post(':id/watchers')
  @ApiOperation({ summary: 'Add watcher to issue' })
  addWatcher(@Param('id') id: string, @Request() req) {
    return this.issuesService.addWatcher(id, req.user.userId);
  }

  @Delete(':id/watchers')
  @ApiOperation({ summary: 'Remove watcher from issue' })
  removeWatcher(@Param('id') id: string, @Request() req) {
    return this.issuesService.removeWatcher(id, req.user.userId);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to issue' })
  addComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    return this.commentsService.create(id, createCommentDto, req.user.userId);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get issue comments' })
  getComments(@Param('id') id: string) {
    return this.commentsService.findAll(id);
  }

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Upload attachment to issue' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async addAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Upload to R2
    const uploadResult = await this.storageService.uploadFile(file, `issues/${id}`);

    // Create attachment record
    return this.issuesService.addAttachment(id, {
      filename: file.originalname,
      url: uploadResult.url,
      key: uploadResult.key,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: req.user.userId,
    });
  }

  @Delete(':issueId/attachments/:attachmentId')
  @ApiOperation({ summary: 'Delete attachment from issue' })
  async deleteAttachment(
    @Param('issueId') issueId: string,
    @Param('attachmentId') attachmentId: string,
    @Request() req,
  ) {
    return this.issuesService.deleteAttachment(attachmentId, req.user.userId);
  }
}
