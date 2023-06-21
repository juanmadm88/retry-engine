import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configValidationSchema } from './schemas/app.schema';
import { appConfig } from './config';
import { CreateTransactionModule } from './create-transaction/create-transaction.module';
import { TbkMallModule } from './tbk-mall/tbk-mall.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './mongo-configuration/configuration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      load: [appConfig]
    }),
    CreateTransactionModule,
    TbkMallModule,
    ConfigurationModule,
    ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
