import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
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

describe('CacheService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('expect successfully created service', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: 'CACHE_MANAGER',
          useValue: {
            get: jest.fn(),
            set: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CacheService = module.get<CacheService>(CacheService);
    expect(service).not.toBeUndefined();
  });
  it('expect data to be retrieved successfuly from Cache ', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: 'CACHE_MANAGER',
          useValue: {
            get: jest
              .fn()
              .mockImplementationOnce(() => Promise.resolve({ data: {} })),
            set: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CacheService = module.get<CacheService>(CacheService);
    const args: any = {
      keyParams: { country: 'pe' }
    };
    const response: any = await service.get(args);
    expect(response).toBeDefined;
  });
  it('expect data to be persisted successfuly into Cache ', async () => {
    const mocked = { set: jest.fn() };
    const spy = jest.spyOn(mocked, 'set');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: 'CACHE_MANAGER',
          useValue: {
            get: jest
              .fn()
              .mockImplementationOnce(() => Promise.resolve({ data: {} })),
            set: mocked.set
          }
        }
      ]
    }).compile();
    const service: CacheService = module.get<CacheService>(CacheService);
    const args: any = {
      keyParams: { country: 'pe' },
      data: {}
    };
    await service.set(args);
    expect(spy).toBeCalled();
  });
  it('expect an Error when trying to persist data into Cache ', async () => {
    const mocked = { set: jest.fn() };
    jest.spyOn(mocked, 'set').mockImplementation(() =>
      Promise.reject({
        response: {}
      })
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: 'CACHE_MANAGER',
          useValue: {
            get: jest
              .fn()
              .mockImplementationOnce(() => Promise.resolve({ data: {} })),
            set: mocked.set
          }
        }
      ]
    }).compile();
    const service: CacheService = module.get<CacheService>(CacheService);
    const args: any = {
      keyParams: { country: 'pe' },
      data: {}
    };
    try {
      await service.set(args);
    } catch (error) {
      expect(error).toBeDefined;
    }
  });
  it('expect an Error when trying to persist data into Cache ', async () => {
    const mocked = { get: jest.fn() };
    jest.spyOn(mocked, 'get').mockImplementation(() =>
      Promise.reject({
        response: {}
      })
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: 'CACHE_MANAGER',
          useValue: {
            get: mocked.get,
            set: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CacheService = module.get<CacheService>(CacheService);
    const args: any = {
      keyParams: { country: 'pe', acquirer: 'interop' }
    };
    try {
      await service.get(args);
    } catch (error) {
      expect(error).toBeDefined;
    }
  });
  it('expect data to be removed successfuly from Cache ', async () => {
    const mocked = { set: jest.fn(), del: jest.fn() };
    const spy = jest.spyOn(mocked, 'del');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: 'CACHE_MANAGER',
          useValue: {
            get: jest.fn(),
            set: mocked.set,
            del: mocked.del
          }
        }
      ]
    }).compile();
    const service: CacheService = module.get<CacheService>(CacheService);
    const args: any = {
      keyParams: { country: 'pe' }
    };
    await service.delete(args);
    expect(spy).toBeCalled();
  });
  it('expect an Error when trying to remove data from Cache ', async () => {
    const mocked = { set: jest.fn(), del: jest.fn() };
    const spy = jest.spyOn(mocked, 'del');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: 'CACHE_MANAGER',
          useValue: {
            get: jest.fn(),
            set: mocked.set,
            del: mocked.del.mockImplementation(() =>
              Promise.reject({ error: 'some error' })
            )
          }
        }
      ]
    }).compile();
    const service: CacheService = module.get<CacheService>(CacheService);
    const args: any = {
      keyParams: { country: 'pe' }
    };
    try {
      await service.delete(args);
    } catch (error) {
      expect(error).toBeDefined;
      expect(spy).toBeCalled();
    }
  });
});
