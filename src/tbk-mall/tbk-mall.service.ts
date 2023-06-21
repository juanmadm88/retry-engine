import { LoggerService } from '../logger/logger.service';
import { Constants } from '../constants';
import { ProxyService } from '../utils/proxy.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class TbkMallService {
  private logger: LoggerService;
  private getMethodName: string;
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService
  ) {
    this.logger = new LoggerService(this.constructor.name);
    this.getMethodName = Constants.TBK_MALL_SERVICE.GET_METHOD.NAME;
  }

  public getTokenByReconciliationId = async (request: any): Promise<any> => {
    try {
      const buyOrder =
        request.options.body.metadata.transaction.reconciliation_id;
      const baseUrl = this.configService.get<string>(
        'appConfig.tbk_mall_service.base_url'
      );
      const options = this.buildOptions({ request, baseUrl, buyOrder });
      this.logger.info(
        this.getMethodName,
        `get token by buyOrder '${buyOrder}' | headers: ${JSON.stringify(
          options.headers
        )}`
      );
      const response = await this.proxyService.doRequest(options);
      this.logger.info(
        this.getMethodName,
        `response from tbk-mall-adapter`,
        JSON.stringify(response)
      );
      return await this.buildResponse(response);
    } catch (error) {
      this.logger.error(
        this.getMethodName,
        'an Error Ocurred while trying to retrieve token ',
        error
      );
      throw error;
    }
  };
  private buildResponse = (response: any): any => {
    if (
      response.status === 200 &&
      Array.isArray(response.data) &&
      response.data.length
    ) {
      return response.data[0].token;
    }
    throw new NotFoundException({
      code: Constants.TBK_MALL_SERVICE.GET_METHOD.NOT_FOUND_ERROR_CODE,
      message: 'the token was not found for technical reverse'
    });
  };
  private buildOptions = (args: any): any => {
    const { request, buyOrder, baseUrl } = args;
    return {
      method: 'GET',
      url: `${baseUrl}/tokens?buy_order=${buyOrder}`,
      headers: {
        'x-flow-country': request.options.headers['x-flow-country'],
        'Content-Type': 'application/json',
        apiKey: this.configService.get<string>(
          'appConfig.tbk_mall_service.api_key'
        ),
        'api-key-secret': this.configService.get<string>(
          'appConfig.tbk_mall_service.api_key_secret'
        )
      },
      json: true,
      timeout: request.options.timeout
    };
  };
}
