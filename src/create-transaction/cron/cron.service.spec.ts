import { Test, TestingModule } from '@nestjs/testing';
import { CronService } from './cron.service';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CreateTransactionService } from '../create-transaction.service';
import { ProxyService } from '../../utils/proxy.service';
import { MongoDBService } from '../../database/mongodb-service/mongodb-service';
import { TbkMallService } from '../../tbk-mall/tbk-mall.service';

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

jest.mock('cron', () => {
  return {
    CronJob: jest.fn().mockImplementation((value, callback) => {
      return {
        start: () => {
          return callback();
        }
      };
    })
  };
});

describe('CronService', () => {
  let cron: CronService;
  const mockedConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'appConfig.cronValue') {
        return 'some cron expression';
      }
    })
  };
  const mockedSchedulerRegistry = {
    addCronJob: jest.fn()
  };
  const mockedService = {
    retry: jest.fn()
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronService,
        { provide: ConfigService, useValue: mockedConfigService },
        { provide: SchedulerRegistry, useValue: mockedSchedulerRegistry },
        { provide: CreateTransactionService, useValue: mockedService },
        ProxyService,
        MongoDBService,
        TbkMallService
      ]
    }).compile();
    cron = module.get<CronService>(CronService);
  });
  it('expect cron service to be defined', () => {
    expect(cron).toBeDefined();
  });
  it('expect addCronJob to be called', () => {
    const spy = jest.spyOn(mockedSchedulerRegistry as any, 'addCronJob');
    const spy2 = jest
      .spyOn(mockedService as any, 'retry')
      .mockImplementationOnce(
        async () => await Promise.reject({ code: 'some code' })
      );
    cron.onModuleInit();
    expect(spy).toBeCalled();
    expect(spy2).toBeCalled();
  });
});
