import { Module } from '@nestjs/common';
import { CreateTransactionService } from './create-transaction.service';
import { CreateTransactionController } from './create-transaction.controller';
import { ProxyService } from '../utils/proxy.service';
import { MongoDBService } from '../database/mongodb-service/mongodb-service';
import { TbkMallService } from '../tbk-mall/tbk-mall.service';
import { CronService } from '../cron/cron.service';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, RmqOptions } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigurationService } from '../mongo-configuration/configuration.service';

@Module({
  controllers: [CreateTransactionController],
  imports: [CacheModule.register()],
  providers: [
    CreateTransactionService,
    ProxyService,
    MongoDBService,
    TbkMallService,
    CronService,
    ConfigurationService,
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
