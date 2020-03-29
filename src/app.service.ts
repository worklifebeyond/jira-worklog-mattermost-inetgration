import { Injectable } from '@nestjs/common';
import { JiraService } from './jira/jira.service';

@Injectable()
export class AppService {

  constructor(private readonly jiraService: JiraService) {
  }

  async getTodayLogWorks(author: string): Promise<any> {
    return this.jiraService.getTodayWorkLogs(author);
  }
}
