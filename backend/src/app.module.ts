import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { TeamsModule } from './teams/teams.module';
import { ProjectsModule } from './projects/projects.module';
import { IssuesModule } from './issues/issues.module';
import { LabelsModule } from './labels/labels.module';
import { CyclesModule } from './cycles/cycles.module';
import { AiModule } from './ai/ai.module';
import { SearchModule } from './search/search.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AutomationModule } from './automation/automation.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ScheduleModule.forRoot(),
    PrismaModule,
    SocketModule,
    AuthModule,
    WorkspacesModule,
    TeamsModule,
    ProjectsModule,
    IssuesModule,
    LabelsModule,
    CyclesModule,
    AiModule,
    SearchModule,
    NotificationsModule,
    WebhooksModule,
    IntegrationsModule,
    AnalyticsModule,
    AutomationModule,
  ],
})
export class AppModule {}
