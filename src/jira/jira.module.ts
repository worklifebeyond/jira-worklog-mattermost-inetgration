import { Module } from '@nestjs/common';
import { JiraService } from './jira.service';

@Module({
  providers: [JiraService],
})
export class JiraModule {}
