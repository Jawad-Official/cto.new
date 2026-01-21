import { Module } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';
import { CommentsService } from './comments.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [IssuesController],
  providers: [IssuesService, CommentsService],
  exports: [IssuesService],
})
export class IssuesModule {}
