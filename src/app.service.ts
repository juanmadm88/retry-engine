import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}
  getHealth(): any {
    const message = `${this.configService.get<string>(
      'appConfig.app_name'
    )} up and running`;
    return {
      code: HttpStatus.OK,
      message
    };
  }
}
