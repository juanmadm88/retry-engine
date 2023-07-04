import { Test, TestingModule } from '@nestjs/testing';
import { RetryPolicyController } from './retry-policy.controller';
import { MongoDBService } from '../database/mongodb-service/mongodb-service';
import { RetryPolicyService } from './retry-policy.service';
import { ConfigService } from '@nestjs/config';
import { ConfigurationDTO } from './dtos';

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

describe('RetryPolicyController', () => {
  let controller: RetryPolicyController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RetryPolicyController],
      providers: [MongoDBService, RetryPolicyService, ConfigService]
    }).compile();
    controller = module.get<RetryPolicyController>(RetryPolicyController);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('expect successfully created controller', async () => {
    expect(controller).toBeDefined();
  });
  it('expect sufesfully resolve when calling create method ', async () => {
    const body: ConfigurationDTO = new ConfigurationDTO({
      country: 'pe',
      time: { '1': '100' },
      failCodes: [1, 2]
    });
    const retryPolicyService = {
      create: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve({ status: 201 }))
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetryPolicyController,
        ConfigService,
        {
          provide: RetryPolicyService,
          useValue: retryPolicyService
        }
      ]
    }).compile();
    const spy = jest.spyOn(retryPolicyService, 'create');
    const controller: RetryPolicyController = module.get<RetryPolicyController>(
      RetryPolicyController
    );
    await controller.create(body);
    expect(spy).toBeCalled();
  });
  it('expect sufesfully resolve when calling update method ', async () => {
    const body: ConfigurationDTO = new ConfigurationDTO({
      country: 'pe',
      time: { '1': '100' },
      failCodes: [1, 2]
    });
    const retryPolicyService = {
      update: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve({ status: 201 }))
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetryPolicyController,
        ConfigService,
        {
          provide: RetryPolicyService,
          useValue: retryPolicyService
        }
      ]
    }).compile();
    const id = '1234';
    const spy = jest.spyOn(retryPolicyService, 'update');
    const controller: RetryPolicyController = module.get<RetryPolicyController>(
      RetryPolicyController
    );
    await controller.update(body, id);
    expect(spy).toBeCalled();
  });
  it('expect sufesfully resolve when calling get method ', async () => {
    const query: any = {
      country: 'pe'
    };
    const retryPolicyService = {
      get: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve({ status: 201 }))
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetryPolicyController,
        ConfigService,
        {
          provide: RetryPolicyService,
          useValue: retryPolicyService
        }
      ]
    }).compile();
    const spy = jest.spyOn(retryPolicyService, 'get');
    const controller: RetryPolicyController = module.get<RetryPolicyController>(
      RetryPolicyController
    );
    await controller.get(query);
    expect(spy).toBeCalled();
  });
});
