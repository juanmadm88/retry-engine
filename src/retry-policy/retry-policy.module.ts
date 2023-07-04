import { Module } from '@nestjs/common';
import { RetryPolicyController } from './retry-policy.controller';
import { MongoDBService } from '../database/mongodb-service/mongodb-service';
import { RetryPolicyService } from './retry-policy.service';

@Module({
  controllers: [RetryPolicyController],
  providers: [MongoDBService, RetryPolicyService],
  exports: [RetryPolicyService]
})
export class RetryPolicyModule {}
