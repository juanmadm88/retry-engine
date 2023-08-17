import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import AsyncCacheModule from './async.cache.module';

@Module({
  imports: [AsyncCacheModule],
  providers: [CacheService],
  exports: [CacheService]
})
export class CacheModule {}
