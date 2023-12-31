import * as mongoose from 'mongoose';
import { LoggerService } from '../../logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import buildResponse from '../../utils/build-response';
import { Constants } from '../../constants';
@Injectable()
export class MongoDBService {
  private readonly uri: string;
  private logger: LoggerService;
  constructor(private configService: ConfigService) {
    this.logger = new LoggerService(this.constructor.name);
  }

  public async updateData(args: any, modelOptions: any): Promise<any> {
    try {
      const model = mongoose.model(modelOptions.name, modelOptions.schema);
      const response = await model.findOneAndUpdate(
        { _id: args.id },
        { $set: args.updateObject },
        { new: true }
      );
      this.logger.info(this.updateData.name, 'Data updated successfully');
      return buildResponse(
        Constants.dtosDictionary[modelOptions.name],
        response
      );
    } catch (error) {
      this.logger.error(this.updateData.name, 'Error updating data ', error);
      throw error;
    }
  }

  public async saveData(data: any, modelOptions: any): Promise<any> {
    try {
      const model = mongoose.model(modelOptions.name, modelOptions.schema);
      await new model(data).save();
      this.logger.info(this.saveData.name, 'Data saved successfully');
    } catch (error) {
      this.logger.error(this.saveData.name, 'Error saving data ', error);
      throw error;
    }
  }

  public async getData(filter: any, modelOptions: any): Promise<any[]> {
    try {
      const model = mongoose.model(modelOptions.name, modelOptions.schema);
      const size: number = this.configService.get<number>(
        'appConfig.numberOfTrxToProcess'
      );
      const response = await model.find(filter).limit(size);
      const transactionLogDTOs: Array<any> = buildResponse(
        Constants.dtosDictionary[modelOptions.name],
        response
      );

      if (response?.length > 0) {
        this.logger.info(
          this.saveData.name,
          `Data retrieved successfully ${JSON.stringify(response)}`
        );
      }
      return transactionLogDTOs;
    } catch (error) {
      this.logger.error(this.saveData.name, 'Error retrieving data ', error);
      throw error;
    }
  }
}
