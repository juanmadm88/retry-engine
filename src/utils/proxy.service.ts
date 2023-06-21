import { BadRequestException, Injectable } from '@nestjs/common';
import { ILogger, LoggerService } from '../logger/logger.service';
import { axiosClient } from '@payments/http-client';
import { Constants } from '../constants';

@Injectable()
export class ProxyService {
  private logger: ILogger;
  private doRequestMethodName: string;
  constructor() {
    this.logger = new LoggerService(this.constructor.name);
    this.doRequestMethodName = Constants.PROXY_SERVICE.DO_REQUEST_METHOD.NAME;
  }
  doRequest = async (args: any): Promise<any> => {
    try {
      this.logger.info(this.doRequestMethodName, 'Sending Request ', args);
      const response = await axiosClient.request(args);
      if (!response) {
        throw new BadRequestException({
          code: Constants.ERROR_INVALID_RESPONSE,
          message: `invalid response from ${args.url}`
        });
      }
      const responseAPI =
        typeof response.data === 'string'
          ? JSON.parse(response.data)
          : response.data;
      this.logger.info(
        this.doRequestMethodName,
        'Returned Response ',
        JSON.stringify(responseAPI)
      );
      return responseAPI;
    } catch (error) {
      this.logger.error(
        this.doRequestMethodName,
        'An error ocurred while trying to do request ',
        error
      );
      throw error;
    }
  };
}
