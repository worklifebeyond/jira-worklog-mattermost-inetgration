import { HttpService, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import * as moment from 'moment';
// import * as ms from 'ms';
import { IncomingDto } from '../incoming.dto';

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

  timeConversion(duration: number) {
    const portions: string[] = [];

    const msInHour = 1000 * 60 * 60;
    const hours = Math.trunc(duration / msInHour);
    if (hours > 0) {
      portions.push(hours + 'h');
      duration = duration - (hours * msInHour);
    }

    const msInMinute = 1000 * 60;
    const minutes = Math.trunc(duration / msInMinute);
    if (minutes > 0) {
      portions.push(minutes + 'm');
      duration = duration - (minutes * msInMinute);
    }

    const seconds = Math.trunc(duration / 1000);
    if (seconds > 0) {
      portions.push(seconds + 's');
    }

    return portions.join(' ');
  }

  async pushToMatterMost(incomingDto: IncomingDto): Promise<any> {
    const url = this.configService.getConfig().logTimeWebHook;
    await this.httpService.post(url, {
      text: `####  ${incomingDto.author} menambahkan LogTime baru!\n**Comment:**  ${incomingDto.comment}\n**Time spent:** ${this.timeConversion(incomingDto.timeSpentSeconds * 1000)}`,
    }).toPromise();
    const payload = await this.getTodayWorkLogs(incomingDto.author);
    await this.httpService.post(url, {text: payload.text}).toPromise();
    return { message: 'ok' };
  }

  async getTodayIssue(author: string): Promise<any> {
    try {
      const url = `${this.configService.getConfig().jiraHost}/rest/api/2/search?jql=worklogDate >= -4d and worklogAuthor = ${author}`;
      const response = await this.httpService.get(url).toPromise();
      return response.data.issues;
    } catch (e) {
      console.log('[GET TODAY ISSUE] ERR ', e);
      throw new UnauthorizedException();
    }
  }

  async getWorkLogs(issueKey: string): Promise<any> {
    try {
      const url = `${this.configService.getConfig().jiraHost}/rest/api/2/issue/${issueKey}/worklog`;
      const response = await this.httpService.get(url).toPromise();
      return response.data.worklogs;
    } catch (e) {
      console.log('[GET WORK LOGS] ERR ', e);
      throw new UnauthorizedException();
    }
  }

  async getTodayWorkLogs(author: string): Promise<any> {
    try {
      let workLogs = [];
      const issues = await this.getTodayIssue(author);

      for (const item of issues) {
        let issueWorkLog = await this.getWorkLogs(item.key);
        issueWorkLog = issueWorkLog.map((wl) => {
          wl.issueKey = item.key;
          wl.issueName = item.fields.summary;
          wl.project = item.fields.project.name;

          return wl;
        });
        workLogs.push(...issueWorkLog);
      }

      workLogs = workLogs.filter((item) => item.author.name === author);
      workLogs = workLogs.filter((item) => moment.utc().isSame(moment.utc(item.started), 'day'));
      workLogs = workLogs.reverse();

      let totalSpentToday = 0;
      let avatar = '';
      let displayName = '';
      let email = '';

      for (const item of workLogs) {
        totalSpentToday += item.timeSpentSeconds;
        avatar = item.author.avatarUrls['48x48'];
        displayName = item.author.displayName;
        email = item.author.emailAddress;
      }

      if (totalSpentToday === 0) {
        return { text: `Belum ada LogTime yang disubmit hari ini oleh **${author}**`, response_type: 'comment' };
      }

      const totalSpentText = this.timeConversion(totalSpentToday * 1000);

      let text = `
        Nama: ${displayName}
        Email: ${email}
        Total LogTime hari ini: ${totalSpentText}
        -----------------------------------------
      `;

      for (const item of workLogs) {
        text += `

          Task: [${item.issueKey}] ${item.issueName}
          Project: ${item.project}
          Comment: ${item.comment}
          Time Spent: ${item.timeSpent}

        `;
      }

      return { text, response_type: 'comment' };
    } catch (e) {
      console.log('[GET TODAY LOGS] ERR ', e);
      // throw new UnauthorizedException();
      return `User **${author}** tidak ditemukan`;
    }
  }

  verifyToken(token: string): boolean {
    return token === this.configService.getConfig().verify;
  }

}
