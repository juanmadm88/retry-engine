import { Controller } from '@nestjs/common';
import {
  Payload,
  MessagePattern,
  Ctx,
  RmqContext
} from '@nestjs/microservices';
import { IService } from './interfaces/service.interface';
import setTraceId from '../utils/set-trace-id';
import injectHeaders from '../utils/inject-headers';
import { LoggerService } from '../logger/logger.service';
import { Constants } from '../constants';

@Controller()
export class BaseController {
  private logger: LoggerService;
  private createMethodName: string;
  constructor(protected readonly service: IService) {
    this.logger = new LoggerService(this.constructor.name);
    this.createMethodName = Constants.BASE_CONTROLLER.CREATE_METHOD.NAME;
  }

  @MessagePattern()
  private async create(@Payload() data: number[], @Ctx() context: RmqContext) {
    try {
      const channel = context.getChannelRef();
      const message = context.getMessage();
      const args = context.getArgByIndex(0);
      injectHeaders(args.properties.headers);
      setTraceId(data, args.properties.headers);
      this.logger.info(
        this.createMethodName,
        `Message Received to queue= ${JSON.stringify(data)}`
      );
      channel.ack(message);
      await this.service.create(data);
    } catch (error) {
      this.logger.error(
        this.createMethodName,
        `An Error has ocurred while receiving message to queue= ${JSON.stringify(
          data
        )}`,
        error
      );
    }
  }
}
