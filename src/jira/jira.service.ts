import { HttpService, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

@Injectable()
export class JiraService {

  constructor(private readonly httpService: HttpService,
              private readonly configService: ConfigService) {
    this.httpService.axiosRef.interceptors.request.use((config) => {
      config.auth = {
        username: configService.getConfig().jiraUser,
        password: configService.getConfig().jiraPass,
      };

      return config;
    });
  }

  async getTodayIssue(author: string): Promise<any> {
    try {
      const url = `${this.configService.getConfig().jiraHost}/rest/api/2/search?jql=worklogDate >= 1d and worklogAuthor = ${author}`;
      const response = await this.httpService.get(url).toPromise();
      return response.data.issues;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async getWorkLogs(issueKey: string): Promise<any> {
    try {
      const url = `${this.configService.getConfig().jiraHost}/rest/api/2/issue/${issueKey}/worklog`;
      const response = await this.httpService.get(url).toPromise();
      return response.data.worklogs;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async getTodayWorkLogs(author: string): Promise<any> {
    try {
      const workLogs = [];
      const issues = await this.getTodayIssue(author);
      issues.foreach(async (item, i) => {
        const issueWorkLog = await this.getWorkLogs(item.key);
        workLogs.push(...issueWorkLog);
      });
      workLogs.filter((item) => item.author.name === author);
      return workLogs;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

}
