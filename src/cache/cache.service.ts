import { LoggerService } from '../logger/logger.service';
import { Inject, Injectable } from '@nestjs/common';
import generateKey from '../utils/generate-key';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Constants } from '../constants';

@Injectable()
export class CacheService {
  private logger: LoggerService;
  private getMethodName: string;
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
    this.logger = new LoggerService(this.constructor.name);
  }

  public get = async (args: any): Promise<any> => {
    try {
      const key: any = generateKey(args.keyParams);
      const response = await this.cacheManager.get(key);
      if (response) {
        this.logger.info(
          Constants.METHODS_NAME.get,
          `Data Retrieved from Cache: ${JSON.stringify(response)}`
        );
      }
      return response;
    } catch (error) {
      this.logger.error(
        Constants.METHODS_NAME.get,
        'An Error Ocurred while trying to retrieve data from Cache ',
        error
      );
      throw error;
    }
  };

  public set = async (args: any): Promise<any> => {
    try {
      const key: string = generateKey(args.keyParams);
      this.logger.info(
        Constants.METHODS_NAME.set,
        `Setting data : ${JSON.stringify(args.data)} into Cache`
      );
      await this.cacheManager.set(key, args.data);
    } catch (error) {
      this.logger.error(
        Constants.METHODS_NAME.set,
        'An Error Ocurred while trying to set data into Cache ',
        error
      );
      throw error;
    }
  };
  public delete = async (args: any): Promise<any> => {
    try {
      const key: string = generateKey(args.keyParams);
      this.logger.info(
        Constants.METHODS_NAME.delete,
        `Deletting data : ${JSON.stringify(
          args.data
        )} from key: ${key} stored in Cache`
      );
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(
        Constants.METHODS_NAME.delete,
        'An Error Ocurred while trying to delete data from Cache ',
        error
      );
      throw error;
    }
  };
}
