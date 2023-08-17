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
import {
  TransactionLog,
  TransactionLogSchema
} from '../database/schemas/transaction-log.schema';
import { RetryPolicyService } from '../retry-policy/retry-policy.service';
import { ConfigurationDTO } from '../retry-policy/dtos';
import { NonSerieDTO } from '../retry-policy/dtos/non-serie.dto';
import { CacheService } from '../cache/cache.service';
import allowedToRetryNotFoundIfIsApiTinError from '../utils/allowed-to-retry-not-found-if-is-api-tin-error';
import injectHeaders from '../utils/inject-headers';
import buildError from '../utils/build-error';
@Injectable()
export class CreateTransactionService implements IService {
  private logger: LoggerService;
  private createMethodName: string;
  constructor(
    private readonly cacheService: CacheService,
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
      response: any,
      newRequest: any,
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
      const allowedCodes: string[] = this.configService.get<Array<string>>(
        'appConfig.api_tin.codesToThrowError'
      );
      newRequest = await this.buildAdditionalDataForTransaction(
        business,
        request
      );
      this.logger.info(
        this.createMethodName,
        `process transaction '${transactionType}' and send to '${this.buildBusinesNameDescription(
          business.name
        )} - ${business.type}' ${
          newRequest.options.body
            ? `| body: ${JSON.stringify(newRequest.options.body)}`
            : ''
        } | headers: ${JSON.stringify(newRequest.options.headers)}`
      );
      response = await this.proxyService.doRequest({
        ...newRequest.options,
        data: newRequest.options.body
      });
      await throwErrorIfAllowed(business.name, response, allowedCodes);
      this.logger.info(
        this.createMethodName,
        `response of transaction ${transId} | reconciliation_id ${request.options.body.metadata.transaction.reconciliation_id} | response:`,
        response
      );
      const transactionLogRequest: TransactionLogDTO =
        TransactionLogMapper.transform(
          typeCall.request,
          { request, newRequest },
          traceId
        );
      const transactionLogResponse: TransactionLogDTO =
        TransactionLogMapper.transform(
          typeCall.response,
          { request, response },
          traceId
        );
      Promise.allSettled([
        this.mongoDBService.saveData(transactionLogRequest, {
          name: TransactionLog.name,
          schema: TransactionLogSchema
        }),
        this.mongoDBService.saveData(transactionLogResponse, {
          name: TransactionLog.name,
          schema: TransactionLogSchema
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
        businessName: business.name,
        response,
        newRequest
      });
      throw error;
    }
  }

  //TODO: AVERIGUAR PORQUE PARA Redeban AL 2DO INTENTO EN EL RETRY ENGINE ORIGINAL
  // LE CAMBIA LOS FAILCODE QUE TRAÍA SETEADO EN EL REQUEST ORIGINAL
  private async reprocessTransaction(record: TransactionLogDTO): Promise<any> {
    let business: any,
      transactionType: any,
      transId: any,
      typeCall: any,
      failCodesConfig: string[];
    const traceId: any = record.getTraceId();
    const data: any = record.getData();
    const { newRequest, request } = data;
    const trsUniqueId: any = record.getTrsUniqueId();
    const retries: any = record.getRetries() + 1;
    const updateObject = { to_be_reprocessed: false, retries };
    const id = record.getId();
    let response: any;
    try {
      failCodesConfig = this.configService.get<Array<string>>(
        'appConfig.failCodes'
      );
      const allowedCodes: string[] = this.configService.get<Array<string>>(
        'appConfig.api_tin.codesToThrowError'
      );
      business = request.options.body.metadata.transaction.business;
      transactionType = request.options.body.transaction_type;
      transId = request.options.body.transaction.unique_id;
      typeCall = buildTypeCall(business.name);
      this.logger.info(
        this.createMethodName,
        `process transaction '${transactionType}' and send to '${this.buildBusinesNameDescription(
          business.name
        )} - ${business.type}' ${
          newRequest.options.body
            ? `| body: ${JSON.stringify(newRequest.options.body)}`
            : ''
        } | headers: ${JSON.stringify(newRequest.options.headers)}`
      );
      this.logger.info(
        this.createMethodName,
        `Updating transaction log trs_unique_id: ${trsUniqueId}, retried: ${retries} times,  into MONGODB `
      );
      await this.mongoDBService.updateData(
        { id, updateObject },
        { name: TransactionLog.name, schema: TransactionLogSchema }
      );
      response = await this.proxyService.doRequest({
        ...newRequest.options,
        data: newRequest.options.body
      });
      await throwErrorIfAllowed(business.name, response, allowedCodes);
      this.logger.info(
        this.createMethodName,
        `response of transaction ${transId} | reconciliation_id ${request.options.body.metadata.transaction.reconciliation_id} | response: `,
        response
      );
      const transactionLogResponse: TransactionLogDTO =
        TransactionLogMapper.transform(
          typeCall.response,
          { request, response },
          traceId
        );

      await this.mongoDBService.saveData(transactionLogResponse, {
        name: TransactionLog.name,
        schema: TransactionLogSchema
      });
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
        businessName: business.name,
        response,
        request
      });
      throw error;
    }
  }

  private buildBusinesNameDescription = (businessName: string): string => {
    return Constants.BUSINESS_NAMES.includes(businessName)
      ? 'api-tin'
      : businessName;
  };

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
      retries,
      response,
      request
    } = args;
    const timeoutCodes: string[] = this.configService.get<Array<string>>(
      'appConfig.timeoutCodes'
    );
    const configTimeSerie: object = this.configService.get<object>(
      'appConfig.timeSerie'
    );
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
        { request, response },
        traceId,
        error
      );
    const config: ConfigurationDTO | undefined = await this.getConfiguration(
      businessName
    );
    const failCodes: string[] = config?.getFailCodes() || failCodesConfig;
    const numberOfRetriesAllowed: number =
      this.getRetriesMaximunByType(config) ||
      Object.values(configTimeSerie || {}).length;
    const numberOfRetriesAreAllowed: boolean = retries < numberOfRetriesAllowed;
    const seconds: number = this.buildSeconds(
      this.getTimeValueByType(config, retries),
      retries,
      configTimeSerie
    );
    const nextExecution = new Date(
      new Date(record.getNextExecution()).getTime() + seconds * 1000
    );
    if (
      allowedToRetry(statusCode, failCodes, error, timeoutCodes) &&
      isLessThanTwentyFourHours(createAt) &&
      numberOfRetriesAreAllowed &&
      allowedToRetryNotFoundIfIsApiTinError(error, businessName) &&
      this.allowedToRetryIfBeforeMidnight(nextExecution, createAt)
    ) {
      this.logger.info(
        Constants.METHODS_NAME.handlerErrorForReprocessTransaction,
        `Allowed to Retry, retrying transaction of unique_id: ${trsUniqueId}`
      );
      const updateObject = {
        next_execution: nextExecution.toString(),
        retries: args.retries,
        to_be_reprocessed: true
      };
      this.logger.info(
        Constants.METHODS_NAME.handlerErrorForReprocessTransaction,
        `Updating transaction log trs_unique_id: ${trsUniqueId} into MONGODB `
      );
      this.logger.info(
        Constants.METHODS_NAME.handlerErrorForReprocessTransaction,
        `Saving response: ${JSON.stringify(
          transactionLogResponse
        )}  into MONGODB `
      );
      Promise.allSettled([
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
        Constants.METHODS_NAME.handlerErrorForReprocessTransaction,
        `Cancelling retries of transaction ${trsUniqueId}`
      );
      this.logger.info(
        Constants.METHODS_NAME.handlerErrorForReprocessTransaction,
        `Saving response: ${JSON.stringify(
          transactionLogResponse
        )} into MONGODB `
      );
      await this.mongoDBService.saveData(transactionLogResponse, {
        name: TransactionLog.name,
        schema: TransactionLogSchema
      });
      this.publishToTransactionProcessor({
        type: typeCall.response,
        error,
        data: request.options.body
      });
    }
  };

  public async retry(): Promise<any> {
    let country: string, keyParams: any;
    const flag: any = {};
    let redisResponse: any;
    try {
      country = this.configService.get<string>('appConfig.country');
      keyParams = { country, flag: 'allowedToReprocess' };
      redisResponse = await this.cacheService.get({ keyParams });
      if (!redisResponse || redisResponse.allowedToReprocess) {
        this.logger.info(
          this.retry.name,
          `Allowed to continue by cached flag: ${JSON.stringify(
            redisResponse
          )}, starting to reprocess transactions`
        );
        flag.allowedToReprocess = false;
        await this.cacheService.set({ keyParams, data: flag });
        const today = new Date();
        const nextDay = new Date(new Date().setHours(23, 59));
        const counter: any = {
          amountOfTrxReprocessedOk: 0,
          amountOfTrxReprocessedWithError: 0
        };
        let results: any;
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
            const data: any = element.getData();
            injectHeaders({
              'kong-request-id': element.getTraceId(),
              'x-flow-country': data.request?.options?.headers['x-flow-country']
            });
            transactionsPromises.push(this.reprocessTransaction(element));
          });
          results = await Promise.allSettled(transactionsPromises);
          results.forEach((value: any) => {
            value.status === 'fulfilled'
              ? (counter.amountOfTrxReprocessedOk += 1)
              : (counter.amountOfTrxReprocessedWithError += 1);
          });

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
        } else {
          this.logger.info(
            this.retry.name,
            'No transactions where found in order to reprocess '
          );
        }
        flag.allowedToReprocess = true;
        await this.cacheService.set({ keyParams, data: flag });
      } else {
        this.logger.info(
          this.retry.name,
          `Blocked by cached flag: ${JSON.stringify(
            redisResponse
          )}, waiting until next job execution to retry`
        );
      }
    } catch (error) {
      flag.allowedToReprocess = true;
      await this.cacheService.set({ keyParams, data: flag });
      this.logger.error(this.retry.name, 'Error retrying transactions ', error);
      throw error;
    }
  }

  private buildTbkMallTransaction = async (request: any): Promise<any> => {
    const newRequest: any = { ...request };
    const token = await this.tbkMallService.getTokenByReconciliationId(request);
    newRequest.options.body.transaction.original_transaction = {
      transaction: {
        unique_id: request.options.body.transaction.unique_id,
        acquirer_unique_id: token
      }
    };
    return newRequest;
  };

  private buildTbkTransaction = (request: any): any => {
    const newRequest: any = { ...request };
    newRequest.options.body.transaction.original_transaction = {
      transaction: { unique_id: request.options.body.transaction.id }
    };
    return newRequest;
  };

  private buildStatusResponseForApinTin = (msg: any): string => {
    const arrayOfResponse: Array<string> = this.configService.get<
      Array<string>
    >('appConfig.api_tin.errorMssgRelatedToStatusPending');
    if (arrayOfResponse.includes(msg.error?.message))
      return Constants.TEF_PENDING_STATUS;
    return Constants.TEF_REJECTED_STATUS;
  };

  private publishToTransactionProcessor = (msg: any) => {
    if (msg.error?.response?.data) msg.error = buildError(msg.error);
    msg.isNewRetryEngine = true;
    if (
      Constants.BUSINESS_NAMES.includes(
        msg.data.metadata.transaction.business.name
      )
    )
      msg.status = this.buildStatusResponseForApinTin(msg);
    this.logger.info(
      Constants.METHODS_NAME.publishToTransactionProcessor,
      `Sending message :${JSON.stringify(msg)} to transaction-log-queue `
    );
    this.producer.send('', msg).subscribe({
      error: (e) =>
        this.logger.error(
          Constants.METHODS_NAME.publishToTransactionProcessor,
          'an Error Ocurred while trying to send message to transaction-log-queue ',
          e
        )
    });
  };

  private handlerError = async (args: any): Promise<any> => {
    const {
      request,
      error,
      typeCall,
      traceId,
      failCodesConfig,
      businessName,
      response,
      newRequest
    } = args;
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
      TransactionLogMapper.transform(
        typeCall.request,
        { request, newRequest },
        traceId
      );
    const transactionLogResponse: TransactionLogDTO =
      TransactionLogMapper.transform(
        typeCall.response,
        { request, response },
        traceId,
        error
      );
    const seconds: number = this.buildSeconds(
      this.getTimeValueByType(config, numberOfRetry),
      numberOfRetry,
      timeSerieConfig
    );
    const nextExecution = new Date(new Date().getTime() + seconds * 1000);
    if (
      allowedToRetry(statusCode, failCodes, error, timeoutCodes) &&
      allowedToRetryNotFoundIfIsApiTinError(error, businessName) &&
      this.allowedToRetryIfBeforeMidnight(nextExecution)
    ) {
      this.logger.info(
        Constants.METHODS_NAME.handlerErrorForReprocessTransaction,
        `Allowed to Retry, retrying transaction of unique_id: ${transactionLogRequest.getTrsUniqueId()}`
      );
      transactionLogRequest.setNextExecution(nextExecution.toString());
      transactionLogRequest.setToBeReprocessed(true);
      this.logger.info(
        Constants.METHODS_NAME.handlerError,
        `Saving request: ${JSON.stringify(transactionLogRequest)} into MONGODB `
      );
      this.logger.info(
        Constants.METHODS_NAME.handlerError,
        `Saving response: ${JSON.stringify(
          transactionLogResponse
        )} into MONGODB `
      );
      Promise.allSettled([
        this.mongoDBService.saveData(transactionLogRequest, {
          name: TransactionLog.name,
          schema: TransactionLogSchema
        }),
        this.mongoDBService.saveData(transactionLogResponse, {
          name: TransactionLog.name,
          schema: TransactionLogSchema
        })
      ]);
    } else {
      this.logger.info(
        Constants.METHODS_NAME.handlerError,
        `Cancelling retries of transaction ${transactionLogRequest.getTrsUniqueId()}`
      );
      this.logger.info(
        Constants.METHODS_NAME.handlerError,
        `Saving request: ${JSON.stringify(transactionLogRequest)} into MONGODB `
      );
      this.logger.info(
        Constants.METHODS_NAME.handlerError,
        `Saving response: ${JSON.stringify(
          transactionLogResponse
        )} into MONGODB `
      );
      Promise.allSettled([
        this.mongoDBService.saveData(transactionLogRequest, {
          name: TransactionLog.name,
          schema: TransactionLogSchema
        }),
        this.mongoDBService.saveData(transactionLogResponse, {
          name: TransactionLog.name,
          schema: TransactionLogSchema
        })
      ]);
      this.publishToTransactionProcessor({
        type: typeCall.response,
        data: request.options.body,
        error
      });
    }
  };

  private buildSfcTransaction = (request: any): any => {
    const newRequest: any = { ...request };
    newRequest.options.body.transaction.original_transaction = {
      transaction: { unique_id: request.options.body.transaction.unique_id }
    };
    return newRequest;
  };

  private buildApiTin = (request: any): any => {
    const newRequest: any = {};
    const { body, ...anotherOptions } = request.options;
    newRequest.options = anotherOptions;
    const apiTinConfig: any =
      this.configService.get<object>('appConfig.api_tin');
    newRequest.options.url = apiTinConfig.endpoint;
    newRequest.options.method = 'GET';
    newRequest.options.headers = {
      'x-flow-country': request.options.headers['x-flow-country'],
      Authorization: apiTinConfig.api_key,
      'x-transaction-id': request.options.body.transaction.unique_id,
      'kong-request-id': request.trace_id
    };
    newRequest.options.timeout = apiTinConfig.timeout;
    return newRequest;
  };

  private allowedToRetryIfBeforeMidnight = (
    nextExecution: Date,
    aDate: Date = new Date()
  ): boolean => {
    aDate.setHours(23, 59);
    return aDate.getTime() - nextExecution.getTime() > 0;
  };

  private getConfiguration = async (
    businessName: string
  ): Promise<ConfigurationDTO | undefined> => {
    try {
      const country: string =
        this.configService.get<string>('appConfig.country');
      const configurationDB: ConfigurationDTO[] =
        await this.retryPolicyService.get(
          {
            country,
            enabled: true,
            acquirer: businessName
          },
          true
        );
      return configurationDB[0];
    } catch (error) {
      this.logger.error(
        Constants.METHODS_NAME.getConfiguration,
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
      if (methods[business.name]) return await methods[business.name](request);
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
