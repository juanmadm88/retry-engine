import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ILogger, LoggerService } from './logger/logger.service';

@Injectable()
export class AppService {
  private logger: ILogger;
  constructor(private configService: ConfigService) {
    this.logger = new LoggerService(this.constructor.name);
  }
  getHealth(): any {
    const message = `${this.configService.get<string>(
      'appConfig.app_name'
    )} up and running`;
    this.logger.info('getHealth', message);
    return {
      code: HttpStatus.OK,
      message
    };
  }
}
