import { Injectable } from '@nestjs/common';
import { JiraService } from './jira/jira.service';
import { IncomingDto } from './incoming.dto';

@Injectable()
export class AppService {

  constructor(private readonly jiraService: JiraService) {
  }

  async getTodayLogWorks(author: string): Promise<any> {
    return this.jiraService.getTodayWorkLogs(author);
  }

  async pushNewLogTime(incomingDto: IncomingDto): Promise<any> {
    return await this.jiraService.pushToMatterMost(incomingDto);
  }

}
