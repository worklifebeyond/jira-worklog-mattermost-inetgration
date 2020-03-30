import { Body, Controller, Post, Query, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';
import { OutgoingDto } from './outgoing.dto';
import { IncomingDto } from './incoming.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Post('/add')
  async addNewLogTime(@Body() incomingDto: IncomingDto, @Query('verify') verify) {
    if (this.appService.verify(verify) === false) {
      throw new UnauthorizedException();
    }
    return this.appService.pushNewLogTime(incomingDto);
  }

  @Post('/today')
  async getLogWorks(@Body() outGoing: OutgoingDto) {
    const words = outGoing.text.trimRight().trimLeft().split(' ');
    if (words.length <= 1) {
      return {
        text: `
          Commands: [today-log] jira_username
          Keterangan: Menampilkan logtime hari ini dari user tertentu
          Contoh: [today-log] kaitokid
        `,
      };
    }

    const author = words[1];
    const message = await this.appService.getTodayLogWorks(author);

    return message;
  }
}
