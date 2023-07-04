import { RetryPolicyService } from './retry-policy.service';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoDBService } from '../database/mongodb-service/mongodb-service';
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

describe('RetryPolicyService ', () => {
  let service: RetryPolicyService;
  it('should expect to be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MongoDBService, ConfigService, RetryPolicyService]
    }).compile();
    service = module.get<RetryPolicyService>(RetryPolicyService);
    expect(service).toBeDefined();
  });
  it('expect a succesfully response when calling getData method from mongoDbService ', async () => {
    const mockedDbService = {
      getData: jest.fn().mockImplementation(() => {
        return Promise.resolve([]);
      })
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MongoDBService, useValue: mockedDbService },
        ConfigService,
        RetryPolicyService
      ]
    }).compile();
    service = module.get<RetryPolicyService>(RetryPolicyService);
    const spy = jest.spyOn(mockedDbService, 'getData');
    await service.get({});
    expect(spy).toBeCalled();
  });
  it('expect a succesfully response when calling saveData method from mongoDbService ', async () => {
    const body: ConfigurationDTO = new ConfigurationDTO({
      country: 'pe',
      time: { '1': '100' }
    });
    const mockedDbService = {
      saveData: jest.fn().mockImplementation(() => {
        return Promise.resolve({ result: {} });
      })
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MongoDBService, useValue: mockedDbService },
        ConfigService,
        RetryPolicyService
      ]
    }).compile();
    service = module.get<RetryPolicyService>(RetryPolicyService);
    const spy = jest.spyOn(mockedDbService, 'saveData');
    await service.create(body);
    expect(spy).toBeCalled();
  });
  it('expect a succesfully response when calling updateData method from mongoDbService ', async () => {
    const body: ConfigurationDTO = new ConfigurationDTO({
      country: 'pe',
      time: { '1': '100' }
    });
    const mockedDbService = {
      updateData: jest.fn().mockImplementation(() => {
        return Promise.resolve({ result: {} });
      })
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MongoDBService, useValue: mockedDbService },
        ConfigService,
        RetryPolicyService
      ]
    }).compile();
    service = module.get<RetryPolicyService>(RetryPolicyService);
    const spy = jest.spyOn(mockedDbService, 'updateData');
    await service.update(body);
    expect(spy).toBeCalled();
  });
  it('expect an Error  when calling updateData method from mongoDbService fails ', async () => {
    const body: ConfigurationDTO = new ConfigurationDTO({
      country: 'pe',
      time: { '1': '100' }
    });
    const mockedDbService = {
      updateData: jest.fn().mockImplementation(() => {
        return Promise.reject({ result: {} });
      })
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MongoDBService, useValue: mockedDbService },
        ConfigService,
        RetryPolicyService
      ]
    }).compile();
    service = module.get<RetryPolicyService>(RetryPolicyService);
    const spy = jest.spyOn(mockedDbService, 'updateData');
    try {
      await service.update(body);
    } catch (error) {
      expect(error).toBeDefined();
      expect(spy).toBeCalled();
    }
  });
  it('expect an Error  when calling saveData method from mongoDbService fails ', async () => {
    const body: ConfigurationDTO = new ConfigurationDTO({
      country: 'pe',
      time: { '1': '100' }
    });
    const mockedDbService = {
      saveData: jest.fn().mockImplementation(() => {
        return Promise.reject({ result: {} });
      })
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MongoDBService, useValue: mockedDbService },
        ConfigService,
        RetryPolicyService
      ]
    }).compile();
    service = module.get<RetryPolicyService>(RetryPolicyService);
    const spy = jest.spyOn(mockedDbService, 'saveData');
    try {
      await service.create(body);
    } catch (error) {
      expect(error).toBeDefined();
      expect(spy).toBeCalled();
    }
  });
  it('expect an Error  when calling getData method from mongoDbService fails ', async () => {
    const mockedDbService = {
      getData: jest.fn().mockImplementation(() => {
        return Promise.reject({ result: {} });
      })
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MongoDBService, useValue: mockedDbService },
        ConfigService,
        RetryPolicyService
      ]
    }).compile();
    service = module.get<RetryPolicyService>(RetryPolicyService);
    const spy = jest.spyOn(mockedDbService, 'getData');
    try {
      await service.get({});
    } catch (error) {
      expect(error).toBeDefined();
      expect(spy).toBeCalled();
    }
  });
});
