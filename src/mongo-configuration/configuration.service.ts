import { LoggerService } from '../logger/logger.service';
import { Constants } from '../constants';
import { Injectable } from '@nestjs/common';
import { MongoDBService } from '../database/mongodb-service/mongodb-service';
import {
  Configuration,
  ConfigurationSchema
} from '../database/schemas/configuration.schema';
import { ConfigurationDTO } from './dtos';
@Injectable()
export class ConfigurationService {
  private logger: LoggerService;
  private createMethodName: string;
  constructor(private readonly mongoDBService: MongoDBService) {
    this.logger = new LoggerService(this.constructor.name);
    this.createMethodName =
      Constants.CREATE_TRANSACTION_SERVICE.CREATE_METHOD.NAME;
  }
  public async create(data: ConfigurationDTO): Promise<any> {
    try {
      this.logger.info(
        this.create.name,
        'Calling MongoDb Service to save data ',
        data
      );
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
  public async update(args: any): Promise<any> {
    try {
      this.logger.info(
        this.update.name,
        'Calling MongoDb Service to update data ',
        args
      );
      await this.mongoDBService.updateData(args, {
        name: Configuration.name,
        schema: ConfigurationSchema
      });
    } catch (error) {
      this.logger.error(
        this.update.name,
        'An Error was thrown while calling MongoDb Service to update data ',
        error
      );
      throw error;
    }
  }
  public async get(filter: any): Promise<ConfigurationDTO[]> {
    try {
      this.logger.info(
        this.get.name,
        'Calling MongoDb Service to get data ',
        filter
      );
      return await this.mongoDBService.getData(filter, {
        name: Configuration.name,
        schema: ConfigurationSchema
      });
    } catch (error) {
      this.logger.error(
        this.get.name,
        'An Error was thrown while calling MongoDb Service to get data ',
        error
      );
      throw error;
    }
  }
}
