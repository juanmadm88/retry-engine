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
      await model.updateOne({ _id: args.id }, { $set: args.updateObject });
      this.logger.info(this.updateData.name, 'Data updated successfully');
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
      this.logger.info(
        this.saveData.name,
        `Data retrieved successfully ${JSON.stringify(response)}`
      );
      const transactionLogDTOs: Array<any> = response
        ? response.map((element) => {
            return buildResponse(
              Constants.dtosDictionary[modelOptions.name],
              element
            );
          })
        : [];
      return transactionLogDTOs;
    } catch (error) {
      this.logger.error(this.saveData.name, 'Error retrieving data ', error);
      throw error;
    }
  }
}
