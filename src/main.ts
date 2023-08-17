import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { InitLogger } from './logger/initializer';
import LOGGER_CONFIG from './config/logger.config';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import * as displayRoutes from 'express-routemap';
import { ValidationPipe } from '@nestjs/common';

async function initFastify(): Promise<NestFastifyApplication> {
  const isFastifyLogger: boolean = process.env.FASTIFY_FM_LOGGER === 'enabled';
  const configFastify = { logger: isFastifyLogger };
  return NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(configFastify)
  );
}

async function initExpress(): Promise<NestExpressApplication> {
  return NestFactory.create<NestExpressApplication>(AppModule);
}

/**
 * Se deja elegir fastify o express como FM vars de entorno
 */
async function bootstrap() {
  InitLogger.setConfig(LOGGER_CONFIG);

  const isFastify: boolean = process.env.FASTIFY_FM_HTTP === 'enabled';

  const app = await (isFastify ? initFastify() : initExpress());

  const configService = app.get(ConfigService);

  InitLogger.addTracing(
    app,
    LOGGER_CONFIG.nameSpaceHook,
    configService.get<string>('appConfig.app_name')
  );

  const appPort: number = isFastify
    ? configService.get<number>('appConfig.fastify_port')
    : configService.get<number>('appConfig.express_port');

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      disableErrorMessages:
        configService.get<string>('appConfig.env')?.toUpperCase() == 'PROD'
          ? true
          : false
    })
  );

  const rabbitConfig: object = configService.get<object>(
    'appConfig.rabbitConfig'
  );
  app.connectMicroservice(rabbitConfig);
  await app.startAllMicroservices();
  await app.listen(appPort, async () => {
    /* eslint-disable */
    console.log(`\x1b[33m starting  the microservice [ ${configService.get('appConfig.app_name')} ]. at ${Date().toString()}`);
    console.log(`\x1b[34m listening on port ${appPort}`);
    console.log(`\x1b[32m running environment NODE_ENV=${configService.get('appConfig.env')}`);
    const server = app.getHttpServer();
    const router = server._events.request._router;
    displayRoutes(router);
    /* eslint-enable */
  });
}
bootstrap();
