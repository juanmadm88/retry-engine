import { Module } from '@nestjs/common';
import { CreateTransactionService } from './create-transaction.service';
import { CreateTransactionController } from './create-transaction.controller';
import { CronService } from './cron/cron.service';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, RmqOptions } from '@nestjs/microservices';
import { TbkMallModule } from '../tbk-mall/tbk-mall.module';
import { RetryPolicyModule } from '../retry-policy/retry-policy.module';
import { DataBaseModule } from '../database/database.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  controllers: [CreateTransactionController],
  imports: [CacheModule, TbkMallModule, RetryPolicyModule, DataBaseModule],
  providers: [
    CreateTransactionService,
    CronService,
    {
      provide: 'RABBIT_PRODUCER',
      useFactory: (configService: ConfigService) => {
        const rabbitConfig: RmqOptions = configService.get<RmqOptions>(
          'appConfig.rabbitProducerConfig'
        );
        return ClientProxyFactory.create(rabbitConfig);
      },
      inject: [ConfigService]
    }
  ]
})
export class CreateTransactionModule {}
