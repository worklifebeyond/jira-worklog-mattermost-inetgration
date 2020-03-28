import { Module, HttpModule  } from '@nestjs/common';
import { JiraService } from './jira.service';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [JiraService],
})
export class JiraModule {}
