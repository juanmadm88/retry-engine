import { Test, TestingModule } from '@nestjs/testing';
import { ProxyService } from '../utils/proxy.service';
import { TbkMallService } from './tbk-mall.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
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

describe('TbkMallService', () => {
  let service: TbkMallService;
  const request = {
    options: {
      body: { metadata: { transaction: { reconciliation_id: '12345' } } },
      headers: { 'x-flow-country': 'pe' }
    }
  };
  const mockedConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'appConfig.tbk_mall_service.base_url') {
        return 'base_url';
      }
      if (key === 'appConfig.tbk_mall_service.api_key') {
        return 'api_key';
      }
      if (key === 'appConfig.tbk_mall_service.api_key_secret') {
        return 'api_key_secret';
      }
    })
  };
  const mockedDoRequest = jest.fn();
  const mockedProxyService = {
    doRequest: mockedDoRequest
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TbkMallService,
        { provide: ConfigService, useValue: mockedConfigService },
        { provide: ProxyService, useValue: mockedProxyService }
      ]
    }).compile();
    service = module.get<TbkMallService>(TbkMallService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('expect service to be defined ', () => {
    expect(service).toBeDefined();
  });
  it('expect an Error when calling proxy service ', async () => {
    const status = 500;
    mockedDoRequest.mockImplementationOnce(() =>
      Promise.reject({ status: status })
    );
    try {
      await service.getTokenByReconciliationId(request);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.status).toBe(status);
    }
  });
  it('expect not found exception when proxy service returns different status from 200 ', async () => {
    const status = 500;
    mockedDoRequest.mockImplementationOnce(() =>
      Promise.resolve({ status: status })
    );
    try {
      await service.getTokenByReconciliationId(request);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });
  it('expect not found exception when proxy service returns different status from 200 ', async () => {
    const token = 'some_token';
    mockedDoRequest.mockImplementationOnce(() =>
      Promise.resolve({ status: 200, data: [{ token }] })
    );
    const response = await service.getTokenByReconciliationId(request);
    expect(response).toBe(token);
  });
});
