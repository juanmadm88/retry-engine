import { TypeCall } from '../utils/common';
import { IService } from '../base/interfaces/service.interface';
import { LoggerService } from '../logger/logger.service';
import buildTypeCall from '../utils/build-type-call';
import { Constants } from '../constants';
import { ProxyService } from '../utils/proxy.service';
import { Inject, Injectable } from '@nestjs/common';
import { MongoDBService } from '../database/mongodb-service/mongodb-service';
import { TransactionLogDTO } from './dtos';
import { TransactionLogMapper } from './mapper/transaction-log.mapper';
import { TbkMallService } from '../tbk-mall/tbk-mall.service';
import { ConfigService } from '@nestjs/config';
import allowedToRetry from '../utils/allowed-to-retry';
import isLessThanTwentyFourHours from '../utils/is-less-than-twenty-four-hours';
import throwErrorIfAllowed from '../utils/throw-error-if-allowed';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ResponseMapper } from './mapper/response.mapper';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  TransactionLog,
  TransactionLogSchema
} from '../database/schemas/transaction-log.schema';
import { RetryPolicyService } from '../retry-policy/retry-policy.service';
import { ConfigurationDTO } from '../retry-policy/dtos';
import buildResponse from '../utils/build-response';
import { NonSerieDTO } from '../retry-policy/dtos/non-serie.dto';
import generateKey from '../utils/generate-key';
@Injectable()
export class CreateTransactionService implements IService {
  private logger: LoggerService;
  private createMethodName: string;
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly proxyService: ProxyService,
    private readonly mongoDBService: MongoDBService,
    private readonly tbkMallService: TbkMallService,
    private configService: ConfigService,
    @Inject('RABBIT_PRODUCER') private producer: ClientProxy,
    private readonly retryPolicyService: RetryPolicyService
  ) {
    this.logger = new LoggerService(this.constructor.name);
    this.createMethodName =
      Constants.CREATE_TRANSACTION_SERVICE.CREATE_METHOD.NAME;
  }
  public async create(request: any): Promise<any> {
    let business: any,
      transactionType: any,
      transId: any,
      typeCall: TypeCall,
      failCodesConfig: string[];
    const traceId: any = request.trace_id;

    try {
      business = request.options.body.metadata.transaction.business;
      transactionType = request.options.body.transaction_type;
      transId = request.options.body.transaction.unique_id;
      typeCall = buildTypeCall(business.name);
      failCodesConfig = this.configService.get<Array<string>>(
        'appConfig.failCodes'
      );
      const allowedCodesToRetry: string[] = this.configService.get<
        Array<string>
      >('appConfig.api_tin.allowedCodesToRetry');
      this.logger.info(
        this.createMethodName,
        `process transaction '${transactionType}' and send to '${
          business.name
        } - ${business.type}' | body: ${JSON.stringify(
          request.options.body
        )} | headers: ${JSON.stringify(request.options.headers)}`
      );
      await this.buildAdditionalDataForTransaction(business, request);
      const response: any = await this.proxyService.doRequest({
        ...request.options,
        data: request.options.body
      });
      await throwErrorIfAllowed(business.name, response, allowedCodesToRetry);
      this.logger.info(
        this.createMethodName,
        `response of transaction ${transId} | reconciliation_id ${request.options.body.metadata.transaction.reconciliation_id} | response:`,
        response
      );
      const transactionLogRequest: TransactionLogDTO =
        TransactionLogMapper.transform(typeCall.request, request, traceId);
      const transactionLogResponse: TransactionLogDTO =
        TransactionLogMapper.transform(typeCall.response, response, traceId);
      await Promise.allSettled([
        this.mongoDBService.saveData(transactionLogRequest, {
          name: TransactionLog.name,
          schema: TransactionLogSchema
        }),
        this.mongoDBService.saveData(transactionLogResponse, {
          name: TransactionLog.name,
          schema: TransactionLogSchema
        }),
        this.publishToTransactionProcessor({
          type: typeCall.request,
          data: request.options.body
        }),
        this.publishToTransactionProcessor({
          type: typeCall.response,
          data: this.buildResponse({ request, response, business })
        })
      ]);

      return response;
    } catch (error) {
      this.logger.error(
        Constants.CREATE_TRANSACTION_SERVICE.CREATE_METHOD.NAME,
        'an Error Ocurred while trying to retry transaction ',
        error
      );
      await this.handlerError({
        request,
        error,
        typeCall,
        traceId,
        failCodesConfig,
        businessName: business.name
      });
      throw error;
    }
  }
  private buildResponse = (args: any): any => {
    const { request, response, business } = args;
    const isFundOut = Constants.BUSINESS_NAMES.includes(business.name);
    if (isFundOut) return ResponseMapper.transform(request, response);
    return response;
  };
  //TODO: AVERIGUAR PORQUE PARA redeban AL 2DO INTENTO EN EL RETRY ENGINE ORIGINAL
  // LE CAMBIA LOS FAILCODES QUE TRAÍA SETEADO EN EL REQUEST ORIGINAL
  private async reprocessTransaction(record: TransactionLogDTO): Promise<any> {
    let business: any,
      transactionType: any,
      transId: any,
      typeCall: any,
      failCodesConfig: string[];
    const traceId: any = record.getTraceId();
    const request: any = record.getData();
    const trsUniqueId: any = record.getTrsUniqueId();
    const retries: any = record.getRetries() + 1;
    const updateObject = { to_be_reprocessed: false, retries };
    const id = record.getId();

    try {
      failCodesConfig = this.configService.get<Array<string>>(
        'appConfig.failCodes'
      );
      const allowedCodesToRetry: string[] = this.configService.get<
        Array<string>
      >('appConfig.api_tin.allowedCodesToRetry');
      business = request.options.body.metadata.transaction.business;
      transactionType = request.options.body.transaction_type;
      transId = request.options.body.transaction.unique_id;
      typeCall = buildTypeCall(business.name);
      this.logger.info(
        this.createMethodName,
        `process transaction '${transactionType}' and send to '${
          business.name
        } - ${business.type}' | body: ${JSON.stringify(
          request.body
        )} | headers: ${JSON.stringify(request.options.headers)}`
      );
      this.logger.info(
        this.createMethodName,
        `Updating transaction log trs_unique_id: ${trsUniqueId} into MONGODB `
      );
      await this.mongoDBService.updateData(
        { id, updateObject },
        { name: TransactionLog.name, schema: TransactionLogSchema }
      );
      await this.buildAdditionalDataForTransaction(business, request);
      const response: any = await this.proxyService.doRequest({
        ...request.options,
        data: request.options.body
      });
      await throwErrorIfAllowed(business.name, response, allowedCodesToRetry);
      this.logger.info(
        this.createMethodName,
        `response of transaction ${transId} | reconciliation_id ${request.options.body.metadata.transaction.reconciliation_id} | response: `,
        response
      );
      const transactionLogResponse: TransactionLogDTO =
        TransactionLogMapper.transform(typeCall.response, response, traceId);
      await Promise.allSettled([
        await this.mongoDBService.saveData(transactionLogResponse, {
          name: TransactionLog.name,
          schema: TransactionLogSchema
        }),
        this.publishToTransactionProcessor({
          type: typeCall.response,
          data: this.buildResponse({ request, response, business })
        })
      ]);
      return response;
    } catch (error) {
      this.logger.error(
        this.reprocessTransaction.name,
        'an Error Ocurred while trying to retry transaction ',
        error
      );
      await this.handlerErrorForReprocessTransaction({
        record,
        error,
        typeCall,
        traceId,
        retries,
        failCodesConfig,
        businessName: business.name
      });
      throw error;
    }
  }

  private handlerErrorForReprocessTransaction = async (
    args: any
  ): Promise<any> => {
    const {
      record,
      error,
      typeCall,
      traceId,
      failCodesConfig,
      businessName,
      retries
    } = args;
    const timeoutCodes: string[] = this.configService.get<Array<string>>(
      'appConfig.timeoutCodes'
    );
    const configTimeSerie: object = this.configService.get<object>(
      'appConfig.timeSerie'
    );
    const request: any = record.getData();
    const statusCode: string =
      error.response?.status || error.response?.statusCode;
    const id: any = record.getId();
    const trsUniqueId: any = record.getTrsUniqueId();
    const createAt = record.getCreatedAt()
      ? new Date(record.getCreatedAt())
      : new Date();
    const transactionLogResponse: TransactionLogDTO =
      TransactionLogMapper.transform(
        typeCall.response,
        record.getData(),
        traceId,
        error
      );
    const config: ConfigurationDTO | undefined = await this.getConfiguration(
      businessName
    );
    const failCodes: string[] = config?.getFailCodes() || failCodesConfig;
    const numberOfRetriesAreAllowed =
      retries < this.getRetriesMaximunByType(config);
    if (
      allowedToRetry(statusCode, failCodes, error, timeoutCodes) &&
      isLessThanTwentyFourHours(createAt) &&
      numberOfRetriesAreAllowed
    ) {
      const seconds: number = this.buildSeconds(
        this.getTimeValueByType(config, retries),
        retries,
        configTimeSerie
      );
      const nextExecution = new Date(
        new Date(record.getNextExecution()).getTime() + seconds * 1000
      );

      const updateObject = {
        next_execution: nextExecution.toString(),
        retries: args.retries,
        to_be_reprocessed: true
      };
      this.logger.info(
        this.handlerErrorForReprocessTransaction.name,
        `Updating transaction log trs_unique_id: ${trsUniqueId} into MONGODB `
      );
      this.logger.info(
        this.handlerErrorForReprocessTransaction.name,
        `Saving response: ${JSON.stringify(
          transactionLogResponse
        )}  into MONGODB `
      );
      await Promise.allSettled([
        this.mongoDBService.updateData(
          { id, updateObject },
          { name: TransactionLog.name, schema: TransactionLogSchema }
        ),
        this.mongoDBService.saveData(transactionLogResponse, {
          name: TransactionLog.name,
          schema: TransactionLogSchema
        })
      ]);
    } else {
      this.logger.info(
        this.handlerErrorForReprocessTransaction.name,
        `Saving response: ${JSON.stringify(
          transactionLogResponse
        )} into MONGODB `
      );
      await Promise.allSettled([
        await this.mongoDBService.saveData(transactionLogResponse, {
          name: TransactionLog.name,
          schema: TransactionLogSchema
        }),
        this.publishToTransactionProcessor({
          type: typeCall.response,
          error,
          data: request.options.body
        })
      ]);
    }
  };

  public async retry(): Promise<any> {
    let country: string, key: string;
    try {
      country = this.configService.get<string>('appConfig.country');
      key = generateKey({ country, flag: 'allowedToReprocess' });
      const flag: any = await this.cacheManager.get(key);
      if (!flag || flag?.allowedToReprocess) {
        await this.cacheManager.set(key, { allowedToReprocess: false });
        const today = new Date();
        const nextDay = new Date(new Date().setHours(23, 59));
        let amountOfTrxReprocessedOk = 0;
        let amountOfTrxReprocessedWithError = 0;
        let counter: any;
        const filter = {
          $expr: {
            $and: [
              {
                $lt: [
                  {
                    $dateDiff: {
                      startDate: '$createdAt',
                      endDate: nextDay,
                      unit: 'millisecond'
                    }
                  },
                  86400000
                ]
              },
              { $eq: [true, '$to_be_reprocessed'] },
              { $lte: ['$next_execution', today] },
              { $regexMatch: { input: '$type_call', regex: /Request/ } }
            ]
          }
        };
        const response: TransactionLogDTO[] = await this.mongoDBService.getData(
          filter,
          { name: TransactionLog.name, schema: TransactionLogSchema }
        );
        if (response?.length > 0) {
          const transactionsPromises: any[] = [];
          response.forEach((element: TransactionLogDTO) => {
            this.logger.info(
              this.retry.name,
              ' Reprocessing transaction ',
              element
            );
            transactionsPromises.push(this.reprocessTransaction(element));
          });
          counter = await Promise.allSettled(transactionsPromises).then(
            (results) => {
              results.forEach((value) => {
                value.status === 'fulfilled'
                  ? (amountOfTrxReprocessedOk += 1)
                  : (amountOfTrxReprocessedWithError += 1);
              });
              return {
                amountOfTrxReprocessedOk,
                amountOfTrxReprocessedWithError
              };
            }
          );
          this.logger.info(
            this.retry.name,
            `Amount of transactions reprocessed successfuly: ${
              counter?.amountOfTrxReprocessedOk || 0
            } `
          );
          this.logger.info(
            this.retry.name,
            `Amount of transactions with error: ${
              counter?.amountOfTrxReprocessedWithError || 0
            } `
          );
        }
        this.logger.info(
          this.retry.name,
          'No transactions where found in order to reprocess '
        );
        await this.cacheManager.set(key, { allowedToReprocess: true });
      }
    } catch (error) {
      await this.cacheManager.set(key, { allowedToReprocess: true });
      this.logger.error(this.retry.name, 'Error retrying transactions ', error);
      throw error;
    }
  }

  private buildTbkMallTransaction = async (request: any): Promise<any> => {
    const token = await this.tbkMallService.getTokenByReconciliationId(request);
    request.options.body.transaction.original_transaction = {
      transaction: {
        unique_id: request.options.body.transaction.unique_id,
        acquirer_unique_id: token
      }
    };
  };

  private buildTbkTransaction = (request: any): void => {
    request.options.body.transaction.original_transaction = {
      transaction: { unique_id: request.options.body.transaction.id }
    };
  };

  private publishToTransactionProcessor = async (msg: any): Promise<any> => {
    try {
      this.logger.info(
        this.publishToTransactionProcessor.name,
        `Sending message :${JSON.stringify(msg)} to transaction-log-queue `
      );
      await firstValueFrom(this.producer.send('', msg));
    } catch (error) {
      this.logger.error(
        this.publishToTransactionProcessor.name,
        'Error trying to publish message into transaction-log-queue ',
        error
      );
      throw error;
    }
  };

  private handlerError = async (args: any): Promise<any> => {
    const { request, error, typeCall, traceId, failCodesConfig, businessName } =
      args;
    const timeoutCodes: string[] = this.configService.get<Array<string>>(
      'appConfig.timeoutCodes'
    );
    const timeSerieConfig: object = this.configService.get<object>(
      'appConfig.timeSerie'
    );
    const numberOfRetry = 1;
    const statusCode: string =
      error.response?.status || error.response?.statusCode;
    const config: ConfigurationDTO | undefined = await this.getConfiguration(
      businessName
    );
    const failCodes: string[] = config?.getFailCodes() || failCodesConfig;
    const transactionLogRequest: TransactionLogDTO =
      TransactionLogMapper.transform(typeCall.request, request, traceId);
    const transactionLogResponse: TransactionLogDTO =
      TransactionLogMapper.transform(
        typeCall.response,
        request,
        traceId,
        error
      );
    if (allowedToRetry(statusCode, failCodes, error, timeoutCodes)) {
      const seconds: number = this.buildSeconds(
        this.getTimeValueByType(config, numberOfRetry),
        numberOfRetry,
        timeSerieConfig
      );
      const nextExecution = new Date(new Date().getTime() + seconds * 1000);
      transactionLogRequest.setNextExecution(nextExecution.toString());
      transactionLogRequest.setToBeReprocessed(true);
      this.logger.info(
        this.handlerError.name,
        `Saving request: ${JSON.stringify(transactionLogRequest)} into MONGODB `
      );
      this.logger.info(
        this.handlerError.name,
        `Saving response: ${JSON.stringify(
          transactionLogResponse
        )} into MONGODB `
      );
      await Promise.allSettled([
        this.mongoDBService.saveData(transactionLogRequest, {
          name: TransactionLog.name,
          schema: TransactionLogSchema
        }),
        this.mongoDBService.saveData(transactionLogResponse, {
          name: TransactionLog.name,
          schema: TransactionLogSchema
        }),
        this.publishToTransactionProcessor({
          type: typeCall.response,
          data: request.options.body,
          error
        }),
        this.publishToTransactionProcessor({
          type: typeCall.request,
          data: request.options.body
        })
      ]);
    } else {
      this.logger.info(
        this.handlerError.name,
        `Saving request: ${JSON.stringify(transactionLogRequest)} into MONGODB `
      );
      this.logger.info(
        this.handlerError.name,
        `Saving response: ${JSON.stringify(
          transactionLogResponse
        )} into MONGODB `
      );
      await Promise.allSettled([
        this.mongoDBService.saveData(transactionLogRequest, {
          name: TransactionLog.name,
          schema: TransactionLogSchema
        }),
        this.mongoDBService.saveData(transactionLogResponse, {
          name: TransactionLog.name,
          schema: TransactionLogSchema
        }),
        this.publishToTransactionProcessor({
          type: typeCall.response,
          data: request.options.body,
          error
        }),
        this.publishToTransactionProcessor({
          type: typeCall.request,
          data: request.options.body
        })
      ]);
    }
  };

  private buildSfcTransaction = (request: any): void => {
    request.options.body.transaction.original_transaction = {
      transaction: { unique_id: request.options.body.transaction.unique_id }
    };
  };

  private buildApiTin = (request: any): void => {
    const apiTinConfig: any =
      this.configService.get<object>('appConfig.api_tin');
    request.options.url = apiTinConfig.endpoint;
    request.options.method = 'GET';
    request.options.headers = {
      'x-flow-country': request.options.headers['x-flow-country'],
      Authorization: apiTinConfig.api_key,
      'x-transaction-id': request.options.body.transaction.unique_id
    };
  };

  private getConfiguration = async (
    businessName: string
  ): Promise<ConfigurationDTO | undefined> => {
    try {
      const country: string =
        this.configService.get<string>('appConfig.country');
      const key = generateKey({ country, businessName });
      const cached: any = await this.cacheManager.get(key);
      if (!cached) {
        const configurationDB: ConfigurationDTO[] =
          await this.retryPolicyService.get({
            country,
            enabled: true,
            acquirer: businessName
          });
        await this.cacheManager.set(key, configurationDB[0]);
        return configurationDB[0];
      }
      this.logger.info(
        this.getConfiguration.name,
        'configuration retrieved from cache ',
        cached
      );
      return buildResponse(Constants.dtosDictionary['Configuration'], cached);
    } catch (error) {
      this.logger.error(
        this.getConfiguration.name,
        'an Error Ocurred while trying to get Configuration ',
        error
      );
      throw error;
    }
  };

  private buildSeconds = (
    secondsFromTimeSerie: number,
    numberOfRetry: number,
    timeSerieConfig: object
  ): number => {
    if (!secondsFromTimeSerie) {
      secondsFromTimeSerie = timeSerieConfig[numberOfRetry] || 30;
    }
    return secondsFromTimeSerie;
  };

  private buildAdditionalDataForTransaction = async (
    business: any,
    request: any
  ): Promise<any> => {
    const methods: any = {
      tbk_mall: this.buildTbkMallTransaction,
      transbank: this.buildTbkTransaction,
      sfc: this.buildSfcTransaction,
      interop: this.buildApiTin,
      bf: this.buildApiTin
    };
    try {
      if (methods[business.name]) await methods[business.name](request);
    } catch (error) {
      throw error;
    }
  };

  private getTimeValueByType = (
    config: ConfigurationDTO,
    retryNumber: number
  ): number => {
    if (config?.getTime()?.getType() === Constants.TYPE_DATA[1]) {
      const timeValue: number = (config.getTime() as NonSerieDTO)
        .getData()
        .getTimePeriod();
      return timeValue;
    }
    return (
      config?.getTime()?.getData() && config.getTime().getData()[retryNumber]
    );
  };

  private getRetriesMaximunByType = (config: ConfigurationDTO): number => {
    if (config?.getTime()?.getType() === Constants.TYPE_DATA[1]) {
      const timeValue: number = (config.getTime() as NonSerieDTO)
        .getData()
        .getRetries();
      return timeValue;
    }
    return (
      config?.getTime()?.getData() &&
      Object.keys(config.getTime().getData()).length
    );
  };
}
