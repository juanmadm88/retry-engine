import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ILogger, LoggerService } from '../../logger/logger.service';
import { CreateTransactionService } from '../../create-transaction/create-transaction.service';

@Injectable()
export class CronService implements OnModuleInit {
  private logger: ILogger;
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private configService: ConfigService,
    @Inject(CreateTransactionService) private service: CreateTransactionService
  ) {
    this.logger = new LoggerService(this.constructor.name);
  }

  onModuleInit() {
    const cronValue = this.configService.get<string>('appConfig.cronValue');
    const job = new CronJob(cronValue, async () => {
      this.logger.info(
        this.onModuleInit.name,
        'Running Job Execution For Retrying Transactions'
      );
      try {
        await this.service.retry();
      } catch (error) {
        this.logger.error(
          this.onModuleInit.name,
          'Error while trying Job Execution For Retrying Transactions, Error: ',
          error
        );
      }
    });
    this.schedulerRegistry.addCronJob('retry service', job);
    job.start();
  }
}
