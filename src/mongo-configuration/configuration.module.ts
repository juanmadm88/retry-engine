import { Module } from '@nestjs/common';
import { ConfigurationController } from './configuration.controller';
import { MongoDBService } from '../database/mongodb-service/mongodb-service';
import { ConfigurationService } from './configuration.service';

@Module({
  controllers: [ConfigurationController],
  providers: [MongoDBService, ConfigurationService]
})
export class ConfigurationModule {}
