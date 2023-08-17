import { LoggerService } from '../logger/logger.service';
import { Constants } from '../constants';
import { BadRequestException, Injectable } from '@nestjs/common';
import { MongoDBService } from '../database/mongodb-service/mongodb-service';
import {
  Configuration,
  ConfigurationSchema
} from '../database/schemas/configuration.schema';
import { ConfigurationDTO } from './dtos';
import { CacheService } from '../cache/cache.service';
import buildResponse from '../utils/build-response';
import validateWrongObjectId from '../utils/validate-wrong-object-id';
@Injectable()
export class RetryPolicyService {
  private logger: LoggerService;
  private createMethodName: string;
  constructor(
    private readonly mongoDBService: MongoDBService,
    private readonly cacheService: CacheService
  ) {
    this.logger = new LoggerService(this.constructor.name);
    this.createMethodName =
      Constants.CREATE_TRANSACTION_SERVICE.CREATE_METHOD.NAME;
  }
  // TODO: SE PODRIA PONER LOGICA PARA IN CATCHEANDOLAS A MEDIDA
  // QUE SE CREAN
  public async create(data: ConfigurationDTO): Promise<any> {
    try {
      this.logger.info(
        this.create.name,
        'Calling MongoDb Service to save data ',
        data
      );
      await this.throwErrorIfActiveRuleExists(data);
      await this.mongoDBService.saveData(data, {
        name: Configuration.name,
        schema: ConfigurationSchema
      });
    } catch (error) {
      this.logger.error(
        this.create.name,
        'An Error was thrown while calling MongoDb Service to save data ',
        error
      );
      throw error;
    }
  }
  private async throwErrorIfActiveRuleExists(
    data: ConfigurationDTO,
    id?: any
  ): Promise<any> {
    const country = data.getCountry();
    const acquirer = data.getAcquirer();
    const response = await this.get({
      country,
      acquirer,
      enabled: true
    });
    if (response?.length > 0) {
      if (id === response[0].getId()) return;
      const someError: BadRequestException = new BadRequestException();
      this.logger.error(
        this.throwErrorIfActiveRuleExists.name,
        `Another active rule with acquirer: ${acquirer} and country: ${country} already exists`,
        someError
      );
      throw someError;
    }
  }

  public async update(args: any): Promise<any> {
    try {
      await this.validateWrongObjectId(args.id);
      this.logger.info(
        this.update.name,
        'Calling MongoDb Service to update data ',
        args
      );
      const responseDB = await this.get({ _id: args.id });
      if (!responseDB[0]) {
        const error: BadRequestException = new BadRequestException();
        this.logger.error(
          this.update.name,
          `Configuration not Found for id: ${args.id}`,
          error
        );
        throw error;
      }
      if (args?.updateObject) {
        responseDB[0].setAcquirer(
          args.updateObject.acquirer || responseDB[0].getAcquirer()
        );
        responseDB[0].setCountry(
          args.updateObject.country || responseDB[0].getCountry()
        );
        await this.throwErrorIfActiveRuleExists(responseDB[0], args.id);
      }
      const response: ConfigurationDTO = await this.mongoDBService.updateData(
        args,
        {
          name: Configuration.name,
          schema: ConfigurationSchema
        }
      );
      Promise.allSettled([
        this.cacheService.delete({
          keyParams: {
            country: response.getCountry(),
            acquirer: response.getAcquirer(),
            enabled: !response.getEnabled()
          },
          data: responseDB[0]
        }),
        this.cacheService.set({
          keyParams: {
            country: response.getCountry(),
            acquirer: response.getAcquirer(),
            enabled: response.getEnabled()
          },
          data: response
        })
      ]);
    } catch (error) {
      this.logger.error(
        this.update.name,
        'An Error was thrown while calling MongoDb Service to update data ',
        error
      );
      throw error;
    }
  }
  public async get(
    filter: any,
    toBeCached = false
  ): Promise<ConfigurationDTO[]> {
    try {
      if (filter._id) {
        await this.validateWrongObjectId(filter._id);
      }
      const keyParams = filter;
      const cached: any = await this.cacheService.get({ keyParams });
      if (!cached) {
        this.logger.info(
          this.get.name,
          'Calling MongoDb Service to get data ',
          filter
        );
        const array: ConfigurationDTO[] = await this.mongoDBService.getData(
          filter,
          {
            name: Configuration.name,
            schema: ConfigurationSchema
          }
        );
        if (toBeCached) await this.cacheService.set({ keyParams, data: array });
        return array;
      }
      const parsedResponse = buildResponse(
        Constants.dtosDictionary['Configuration'],
        cached
      );
      if (Array.isArray(parsedResponse)) return parsedResponse;
      return [parsedResponse];
    } catch (error) {
      this.logger.error(
        this.get.name,
        'An Error was thrown while calling MongoDb Service to get data ',
        error
      );
      throw error;
    }
  }
  private async validateWrongObjectId(id: any): Promise<any> {
    if (!validateWrongObjectId(id)) {
      const error: BadRequestException = new BadRequestException();
      this.logger.error(
        this.update.name,
        `id: ${id} is not a valid Mongoose ObjectId `,
        error
      );
      throw error;
    }
  }
}
