import { Module } from '@nestjs/common';
import { CreateTransactionService } from './create-transaction.service';
import { CreateTransactionController } from './create-transaction.controller';
import { CronService } from './cron/cron.service';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, RmqOptions } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { TbkMallModule } from '../tbk-mall/tbk-mall.module';
import { RetryPolicyModule } from '../retry-policy/retry-policy.module';
import { DataBaseModule } from '../database/database.module';

@Module({
  controllers: [CreateTransactionController],
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          store: redisStore,
          host: configService.get<string>('appConfig.redisConfig.host'),
          port: configService.get<number>('appConfig.redisConfig.port'),
          password: configService.get<string>('appConfig.redisConfig.password')
        };
      }
    }),
    TbkMallModule,
    RetryPolicyModule,
    DataBaseModule
  ],
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
