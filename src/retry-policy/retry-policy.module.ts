import { Module } from '@nestjs/common';
import { RetryPolicyController } from './retry-policy.controller';
import { MongoDBService } from '../database/mongodb-service/mongodb-service';
import { RetryPolicyService } from './retry-policy.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  controllers: [RetryPolicyController],
  providers: [MongoDBService, RetryPolicyService],
  exports: [RetryPolicyService]
})
export class RetryPolicyModule {}
