import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { CacheConnectionOptions } from '../utils/common';
import { ConfigService } from '@nestjs/config';

export default CacheModule.registerAsync({
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const connection: CacheConnectionOptions = {
      store: redisStore,
      host: configService.get<string>('appConfig.redisConfig.host'),
      port: configService.get<number>('appConfig.redisConfig.port'),
      password: configService.get<string>('appConfig.redisConfig.password')
    };
    if (configService.get<boolean>('appConfig.redisConfig.tls'))
      connection.tls = {};
    return connection;
  }
});
