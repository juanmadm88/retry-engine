import { Test, TestingModule } from '@nestjs/testing';
import { ProxyService } from '../utils/proxy.service';
import { CreateTransactionController } from './create-transaction.controller';
import { CreateTransactionService } from './create-transaction.service';
import { MongoDBService } from '../database/mongodb-service/mongodb-service';
import { TbkMallService } from '../tbk-mall/tbk-mall.service';
import { ConfigService } from '@nestjs/config';
import { ConfigurationService } from '../mongo-configuration/configuration.service';

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

const mockAck = jest.fn();
const mockArgByIndex = jest.fn().mockImplementation(() => ({
  properties: {
    headers: 'some headers'
  }
}));
const mockContext = {
  getChannelRef: jest.fn().mockImplementation(() => ({
    ack: mockAck
  })),
  getMessage: jest.fn(),
  getArgByIndex: mockArgByIndex
};

describe('CreateTransactionController', () => {
  let controller: CreateTransactionController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateTransactionController],
      providers: [
        CreateTransactionService,
        ProxyService,
        MongoDBService,
        TbkMallService,
        ConfigService,
        ConfigurationService,
        {
          provide: 'RABBIT_PRODUCER',
          useValue: {
            send: jest.fn()
          }
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: {
            get: jest.fn(),
            set: jest.fn()
          }
        }
      ]
    }).compile();
    controller = module.get<CreateTransactionController>(
      CreateTransactionController
    );
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('expect successfully created controller', async () => {
    expect(controller).toBeDefined();
  });
  it('expect an Error ', async () => {
    let ackSpy: any;
    try {
      const createSpy = jest.spyOn(controller as any, 'create');
      ackSpy = jest.spyOn(mockContext.getChannelRef(), 'ack');
      const getCreateImplementation = createSpy.getMockImplementation();
      await getCreateImplementation(
        { 'x-headers': 'some header' },
        mockContext
      );
    } catch (error) {
      expect(error).toBeDefined();
      expect(ackSpy).toHaveBeenCalledTimes(0);
    }
  });
});
