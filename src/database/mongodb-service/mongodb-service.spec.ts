import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

const mockSave = jest.fn();
const mockModel = jest.fn();
jest.mock('mongoose', () => {
  return {
    model: mockModel
  };
});

jest.mock('../schemas/transaction-log.schema', () => {
  return {
    TransactionLog: { name: 'dummy' },
    TransactionLogSchema: jest.fn()
  };
});
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
import { MongoDBService } from './mongodb-service';
describe('MongoDBService', () => {
  let service: MongoDBService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MongoDBService, ConfigService]
    }).compile();
    service = module.get<MongoDBService>(MongoDBService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('expect successfully created service', async () => {
    expect(service).not.toBeUndefined();
  });
  it('expect mongoose method save to be called', async () => {
    mockModel.mockImplementationOnce(() => {
      return function () {
        return {
          save: mockSave
        };
      };
    });
    await service.saveData({}, {});
    expect(mockSave).toHaveBeenCalledTimes(1);
  });
  it('expect an Error ', async () => {
    try {
      mockModel.mockImplementationOnce(() => {
        return function () {
          return {
            save: mockSave
          };
        };
      });
      mockSave.mockImplementationOnce(() => Promise.reject({}));
      await service.saveData({}, {});
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('expect getData to be called ', async () => {
    const mockLimit = jest.fn().mockImplementation(() => {
      return [
        {
          _id: '1234',
          created_at: 'Wed May 31 2023 17:46:23 GMT-0300'
        }
      ];
    });
    mockModel.mockImplementationOnce(() => {
      return {
        find: () => {
          return {
            limit: mockLimit
          };
        }
      };
    });
    const spy = jest.spyOn(service as any, 'getData');
    const response: any = await service.getData({}, { name: 'TransactionLog' });
    expect(spy).toBeCalled();
    expect(response.length > 0).toBe(true);
    expect(response[0].getId()).toBeDefined();
  });
  it('expect getData to return empty array ', async () => {
    const mockLimit = jest.fn().mockImplementation(() => {
      return undefined;
    });
    mockModel.mockImplementationOnce(() => {
      return {
        find: () => {
          return {
            limit: mockLimit
          };
        }
      };
    });
    const spy = jest.spyOn(service as any, 'getData');
    const response: any = await service.getData({}, {});
    expect(spy).toBeCalled();
    expect(response.length === 0).toBe(true);
  });
  it('expect an Error when calling getData ', async () => {
    const mockLimit = jest.fn();
    mockModel.mockImplementationOnce(() => {
      return {
        find: () => {
          return {
            limit: mockLimit
          };
        }
      };
    });
    try {
      mockLimit.mockImplementationOnce(() =>
        Promise.reject({ code: 'some code' })
      );
      await service.getData({}, {});
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('expect an Error when calling updateData ', async () => {
    mockModel.mockImplementationOnce(() => {
      return {
        updateOne: () => {
          return Promise.reject({});
        }
      };
    });
    try {
      await service.updateData({}, {});
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('expect success when calling updateData ', async () => {
    mockModel.mockImplementationOnce(() => {
      return {
        updateOne: () => {
          return Promise.resolve({});
        }
      };
    });

    const args = {
      id: '1234',
      updateObject: {}
    };
    await service.updateData(args, {});
  });
});
