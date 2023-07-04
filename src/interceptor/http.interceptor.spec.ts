import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import * as request from 'supertest';
import { HttpInterceptor } from './http.interceptor';
import { CacheModule } from '@nestjs/cache-manager';
import { RetryPolicyController } from '../retry-policy/retry-policy.controller';
import { RetryPolicyService } from '../retry-policy/retry-policy.service';
import { MongoDBService } from '../database/mongodb-service/mongodb-service';
import { plainToInstance } from 'class-transformer';
import { ConfigurationDTO } from '../retry-policy/dtos';

jest.mock('@payments/common-logger', () => {
  const mockedLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
  const mockedLoggerFactory = {
    getLogger: () => mockedLogger
  };
  const nodeFunctions = {
    asyncHookCreate: jest.fn(),
    traceMiddleware: () => {
      return jest.fn();
    },
    getTraceHeaders: jest.fn(),
    Logger: mockedLoggerFactory
  };
  return {
    node: nodeFunctions,
    obfuscate: jest.fn(),
    setLoggerConfig: jest.fn()
  };
});

describe('HttpInterceptor ', () => {
  it('should expect to be defined', async () => {
    const interceptor: HttpInterceptor = new HttpInterceptor();
    expect(interceptor).toBeDefined();
  });
  it('should expect an Error when intercept arguments method are undefined', async () => {
    const interceptor: HttpInterceptor = new HttpInterceptor();
    try {
      interceptor.intercept(undefined, undefined);
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  describe('intercept ', () => {
    it('expected pipe to be called ', async () => {
      const interceptor: HttpInterceptor = new HttpInterceptor();
      const executionContext = {
        switchToHttp: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnThis(),
        getClass: jest.fn().mockReturnThis(),
        getHandler: jest.fn().mockReturnThis(),
        getArgs: jest.fn().mockReturnThis(),
        getArgByIndex: jest.fn().mockReturnThis(),
        switchToRpc: jest.fn().mockReturnThis(),
        switchToWs: jest.fn().mockReturnThis(),
        getType: jest.fn().mockReturnThis(),
        getResponse: jest.fn().mockReturnThis()
      };
      const callHandler = {
        handle: jest.fn().mockReturnThis(),
        pipe: jest.fn().mockReturnThis()
      };
      (callHandler.handle().pipe as jest.Mock<any, any>).mockReturnValueOnce({
        attribute: 'some attribute'
      });
      (
        executionContext.switchToHttp().getRequest as jest.Mock<any, any>
      ).mockReturnValueOnce({
        body: { data: 'mocked data' },
        headers: { 'x-flow-country': 'pe' }
      });
      const actualValue = await interceptor.intercept(
        executionContext,
        callHandler
      );
      expect(actualValue).toBeDefined();
      expect(callHandler.pipe).toBeCalledTimes(1);
    });
    it('expected BAD REQUEST to be returned ', async () => {
      const mockedMongoDBService = {
        getData: jest.fn(),
        saveData: jest.fn(),
        updateData: jest.fn()
      };
      let app: INestApplication;
      const mockedRetryPolicyService = {
        get: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      };
      const controller: TestingModuleBuilder = Test.createTestingModule({
        imports: [CacheModule.register({ isGlobal: true })],
        controllers: [RetryPolicyController],
        providers: [
          { provide: APP_INTERCEPTOR, useClass: HttpInterceptor },
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'appConfig.country') {
                  return 'pe';
                }
              })
            }
          },
          { provide: RetryPolicyService, useValue: mockedRetryPolicyService },
          {
            provide: MongoDBService,
            useValue: mockedMongoDBService
          }
        ]
      });
      const initializeApp = async () => {
        app = (await controller.compile()).createNestApplication();
        await app.init();
      };
      await initializeApp();
      return request(app.getHttpServer())
        .post('/configuration')
        .set('x-flow-country', 'co')
        .send({})
        .then((response) => {
          expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });
    });
    it('expected 200 STATUS OK to be returned ', async () => {
      let app: INestApplication;
      const mockedMongoDBService = {
        getData: jest.fn(),
        saveData: jest.fn(),
        updateData: jest.fn()
      };
      const mockedRetryPolicyService = {
        get: jest.fn().mockImplementation(() => {
          return [
            plainToInstance(ConfigurationDTO, {
              country: 'pe',
              enabled: true,
              failCodes: [3, 5, 408],
              acquirer: 'interop',
              time: {
                type: 'serie',
                data: {
                  '1': '300',
                  '2': '400'
                }
              }
            })
          ];
        }),
        create: jest.fn(),
        update: jest.fn()
      };
      const controller: TestingModuleBuilder = Test.createTestingModule({
        imports: [CacheModule.register({ isGlobal: true })],
        controllers: [RetryPolicyController],
        providers: [
          { provide: APP_INTERCEPTOR, useClass: HttpInterceptor },
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'appConfig.country') {
                  return 'pe';
                }
              })
            }
          },
          {
            provide: RetryPolicyService,
            useValue: mockedRetryPolicyService
          },
          {
            provide: MongoDBService,
            useValue: mockedMongoDBService
          }
        ]
      });
      const initializeApp = async () => {
        app = (await controller.compile()).createNestApplication();
        await app.init();
      };
      await initializeApp();
      return request(app.getHttpServer())
        .get('/configuration')
        .set('x-flow-country', 'pe')
        .query('country=pe&acquirer=interop&enabled=true')
        .then((response) => {
          expect(response.statusCode).toBe(HttpStatus.OK);
        });
    });
  });
});
