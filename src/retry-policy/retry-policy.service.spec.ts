import { RetryPolicyService } from './retry-policy.service';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoDBService } from '../database/mongodb-service/mongodb-service';
import { ConfigService } from '@nestjs/config';
import { ConfigurationDTO } from './dtos';
import { CacheService } from '../cache/cache.service';
import { plainToInstance } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

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
    const mockedCacheService = {
      get: jest.fn().mockImplementation(() => {
        return undefined;
      })
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongoDBService,
        ConfigService,
        RetryPolicyService,
        { provide: CacheService, useValue: mockedCacheService }
      ]
    }).compile();
    service = module.get<RetryPolicyService>(RetryPolicyService);
    expect(service).toBeDefined();
  });
  it('expect a succesfully response when calling getData method from mongoDbService ', async () => {
    const mockedDbService = {
      getData: jest.fn().mockImplementation(() => {
        return Promise.resolve([
          {
            country: 'pe',
            acquirer: 'interop'
          }
        ]);
      })
    };
    const mockedCacheService = {
      get: jest.fn().mockImplementation(() => {
        return undefined;
      }),
      set: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MongoDBService, useValue: mockedDbService },
        ConfigService,
        { provide: CacheService, useValue: mockedCacheService },
        RetryPolicyService
      ]
    }).compile();
    service = module.get<RetryPolicyService>(RetryPolicyService);
    const spy = jest.spyOn(mockedDbService, 'getData');
    await service.get({}, true);
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
      }),
      getData: jest.fn()
    };
    const mockedCacheService = {
      get: jest.fn().mockImplementation(() => {
        return undefined;
      }),
      set: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MongoDBService, useValue: mockedDbService },
        ConfigService,
        { provide: CacheService, useValue: mockedCacheService },
        RetryPolicyService
      ]
    }).compile();
    service = module.get<RetryPolicyService>(RetryPolicyService);
    const spy = jest.spyOn(mockedDbService, 'saveData');
    await service.create(body);
    expect(spy).toBeCalled();
  });
  it('expect a succesfully response when calling updateData method from mongoDbService ', async () => {
    const body: any = {
      country: 'pe',
      time: { '1': '100' },
      id: '551137c2f9e1fac808a5f572'
    };
    const mockedDbService = {
      updateData: jest.fn().mockImplementation(() => {
        return Promise.resolve(
          plainToInstance(ConfigurationDTO, {
            _id: '100',
            acquirer: 'interop',
            country: 'pe'
          })
        );
      }),
      getData: jest.fn().mockImplementation(() => {
        return [
          plainToInstance(ConfigurationDTO, {
            acquirer: 'interop'
          })
        ];
      })
    };
    const mockedCacheService = {
      get: jest.fn().mockImplementation(() => {
        return undefined;
      }),
      set: jest.fn(),
      delete: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MongoDBService, useValue: mockedDbService },
        ConfigService,
        { provide: CacheService, useValue: mockedCacheService },
        RetryPolicyService
      ]
    }).compile();
    service = module.get<RetryPolicyService>(RetryPolicyService);
    const spy = jest.spyOn(mockedDbService, 'updateData');
    const spyCacheSet = jest.spyOn(mockedCacheService, 'set');
    const spyCacheDelete = jest.spyOn(mockedCacheService, 'delete');
    await service.update(body);
    expect(spy).toBeCalled();
    expect(spyCacheSet).toBeCalled;
    expect(spyCacheDelete).toBeCalled;
  });
  it('expect an Error  when calling updateData method from mongoDbService fails ', async () => {
    const body: any = {
      id: '551137c2f9e1fac808a5f572',
      updateObject: {
        enabled: true
      }
    };
    const mockedDbService = {
      updateData: jest.fn().mockImplementation(() => {
        return Promise.reject({ result: {} });
      }),
      getData: jest
        .fn()
        .mockImplementation(() => {
          return [
            plainToInstance(ConfigurationDTO, {
              _id: '100',
              acquirer: 'interop',
              country: 'pe'
            })
          ];
        })
        .mockImplementation(() => {
          return [{ data: {} }];
        })
    };
    const mockedCacheService = {
      get: jest.fn().mockImplementation(() => {
        return undefined;
      }),
      set: jest.fn(),
      delete: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MongoDBService, useValue: mockedDbService },
        ConfigService,
        { provide: CacheService, useValue: mockedCacheService },
        RetryPolicyService
      ]
    }).compile();
    service = module.get<RetryPolicyService>(RetryPolicyService);
    const spy = jest.spyOn(mockedDbService, 'updateData');
    try {
      await service.update(body);
    } catch (error) {
      expect(error).toBeDefined();
      expect(spy).not.toBeCalled();
    }
  });
  it('expect an Error  when calling saveData method from mongoDbService fails ', async () => {
    const body: ConfigurationDTO = new ConfigurationDTO({
      country: 'pe',
      time: { '1': '100' }
    });
    const mockedCacheService = {
      get: jest.fn().mockImplementation(() => {
        return undefined;
      }),
      set: jest.fn()
    };
    const mockedDbService = {
      saveData: jest.fn().mockImplementation(() => {
        return Promise.reject({ result: {} });
      }),
      getData: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MongoDBService, useValue: mockedDbService },
        ConfigService,
        { provide: CacheService, useValue: mockedCacheService },
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
    const mockedCacheService = {
      get: jest.fn().mockImplementation(() => {
        return undefined;
      }),
      set: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MongoDBService, useValue: mockedDbService },
        ConfigService,
        { provide: CacheService, useValue: mockedCacheService },
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
  it('expect response retrieved from Cache ', async () => {
    const mockedDbService = {
      getData: jest.fn()
    };
    const mockedCacheService = {
      get: jest.fn().mockImplementation(() => {
        return Promise.resolve([
          {
            country: 'pe',
            enabled: true
          }
        ]);
      }),
      set: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MongoDBService, useValue: mockedDbService },
        ConfigService,
        { provide: CacheService, useValue: mockedCacheService },
        RetryPolicyService
      ]
    }).compile();
    service = module.get<RetryPolicyService>(RetryPolicyService);
    const spy = jest.spyOn(mockedDbService, 'getData');
    const response = await service.get({});
    expect(response).toBeDefined;
    expect(spy).not.toBeCalled();
  });
  it('expect a Bad Request Error when a rule for a country and acquirer already exists', async () => {
    const body: ConfigurationDTO = new ConfigurationDTO({
      country: 'pe',
      time: { '1': '100' }
    });
    const mockedDbService = {
      saveData: jest.fn().mockImplementation(() => {
        return Promise.resolve({ result: {} });
      }),
      getData: jest.fn().mockImplementation(() =>
        Promise.resolve([
          plainToInstance(ConfigurationDTO, {
            _id: '100',
            acquirer: 'interop',
            country: 'pe'
          })
        ])
      )
    };
    const mockedCacheService = {
      get: jest.fn().mockImplementation(() => {
        return undefined;
      }),
      set: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MongoDBService, useValue: mockedDbService },
        ConfigService,
        { provide: CacheService, useValue: mockedCacheService },
        RetryPolicyService
      ]
    }).compile();
    service = module.get<RetryPolicyService>(RetryPolicyService);
    const spy = jest.spyOn(mockedDbService, 'getData');
    try {
      await service.create(body);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(spy).toBeCalled();
    }
  });
  it('expect an Array response when an object is cached ', async () => {
    const mockedDbService = {
      saveData: jest.fn(),
      getData: jest.fn()
    };
    const mockedCacheService = {
      get: jest.fn().mockImplementation(() => {
        return { data: {} };
      }),
      set: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MongoDBService, useValue: mockedDbService },
        ConfigService,
        { provide: CacheService, useValue: mockedCacheService },
        RetryPolicyService
      ]
    }).compile();
    service = module.get<RetryPolicyService>(RetryPolicyService);
    const spy = jest.spyOn(mockedDbService, 'getData');
    const response = await service.get({});
    expect(Array.isArray(response)).toBeTruthy();
    expect(spy).toBeCalledTimes(0);
  });
  it('expect a bad request response when calling updateData method from mongoDbService and configuration is not found when searching by id ', async () => {
    const body: any = {
      country: 'pe',
      time: { '1': '100' },
      id: '551137c2f9e1fac808a5f572'
    };
    const mockedDbService = {
      updateData: jest.fn().mockImplementation(() => {
        return Promise.resolve(
          plainToInstance(ConfigurationDTO, {
            _id: '100',
            acquirer: 'interop',
            country: 'pe'
          })
        );
      }),
      getData: jest.fn().mockImplementation(() => {
        return [];
      })
    };
    const mockedCacheService = {
      get: jest.fn().mockImplementation(() => {
        return undefined;
      }),
      set: jest.fn(),
      delete: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MongoDBService, useValue: mockedDbService },
        ConfigService,
        { provide: CacheService, useValue: mockedCacheService },
        RetryPolicyService
      ]
    }).compile();
    service = module.get<RetryPolicyService>(RetryPolicyService);
    const spy = jest.spyOn(mockedDbService, 'updateData');
    try {
      await service.update(body);
    } catch (error) {
      expect(error).toBeDefined();
      expect(spy).not.toBeCalled();
    }
  });
  it('expect a bad request response when id passed by path param is not a valid ObjectId ', async () => {
    const body: any = {
      country: 'pe',
      time: { '1': '100' },
      id: '1234'
    };
    const mockedDbService = {
      updateData: jest.fn().mockImplementation(() => {
        return Promise.resolve(
          plainToInstance(ConfigurationDTO, {
            _id: '100',
            acquirer: 'interop',
            country: 'pe'
          })
        );
      }),
      getData: jest.fn().mockImplementation(() => {
        return [];
      })
    };
    const mockedCacheService = {
      get: jest.fn().mockImplementation(() => {
        return undefined;
      }),
      set: jest.fn(),
      delete: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MongoDBService, useValue: mockedDbService },
        ConfigService,
        { provide: CacheService, useValue: mockedCacheService },
        RetryPolicyService
      ]
    }).compile();
    service = module.get<RetryPolicyService>(RetryPolicyService);
    const spy = jest.spyOn(mockedDbService, 'updateData');
    try {
      await service.update(body);
    } catch (error) {
      expect(error).toBeDefined();
      expect(spy).not.toBeCalled();
    }
  });
  it('expect succesfull response ', async () => {
    const body: any = {
      id: '551137c2f9e1fac808a5f572',
      updateObject: {
        enabled: true
      }
    };
    const mockedDbService = {
      updateData: jest.fn().mockImplementation(() => {
        return Promise.resolve(
          plainToInstance(ConfigurationDTO, {
            _id: '551137c2f9e1fac808a5f572',
            acquirer: 'interop',
            country: 'pe'
          })
        );
      }),
      getData: jest.fn().mockImplementation(() => {
        return [
          plainToInstance(ConfigurationDTO, {
            _id: '551137c2f9e1fac808a5f572',
            acquirer: 'interop',
            country: 'pe'
          })
        ];
      })
    };
    const mockedCacheService = {
      get: jest.fn().mockImplementation(() => {
        return undefined;
      }),
      set: jest.fn(),
      delete: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: MongoDBService, useValue: mockedDbService },
        ConfigService,
        { provide: CacheService, useValue: mockedCacheService },
        RetryPolicyService
      ]
    }).compile();
    service = module.get<RetryPolicyService>(RetryPolicyService);
    const spy = jest.spyOn(mockedDbService, 'updateData');
    await service.update(body);
    expect(spy).toBeCalled();
  });
});
