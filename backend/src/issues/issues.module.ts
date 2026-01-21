import { Module } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';
import { CommentsService } from './comments.service';

@Module({
  controllers: [IssuesController],
  providers: [IssuesService, CommentsService],
  exports: [IssuesService],
})
export class IssuesModule {}
