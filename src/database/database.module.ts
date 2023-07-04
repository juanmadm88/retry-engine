import { Module } from '@nestjs/common';
import { MongoDBService } from '../database/mongodb-service/mongodb-service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mongoose, { ConnectOptions } from 'mongoose';
/* istanbul ignore file */

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const uri = config.get<string>('appConfig.mongoConnection.uri');
        const pass = config.get<string>('appConfig.mongoConnection.pass');
        const user = config.get<string>('appConfig.mongoConnection.user');
        const tls = config.get<boolean>('appConfig.mongoConnection.tls');
        const options: ConnectOptions = {
          pass,
          user,
          tls
        };
        return {
          uri: uri,
          pass: options.pass,
          user: options.user,
          tls: options.tls,
          connectionFactory: async () => {
            const connection = mongoose.connection;
            await mongoose.connect(uri, options);
            return connection;
          }
        };
      }
    })
  ],
  providers: [MongoDBService],
  exports: [MongoDBService]
})
export class DataBaseModule {}
