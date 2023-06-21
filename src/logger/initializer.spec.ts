import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { appConfig } from '../config';
import COMMON_LOGGER_CONFIG from '../config/logger.config';
import { InitLogger } from './initializer';

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

describe('test class initializer', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({}).compile();
    app = moduleFixture.createNestApplication();
  });

  it('test setConfig', () => {
    const spy = jest.spyOn(InitLogger, 'setConfig');
    InitLogger.setConfig(COMMON_LOGGER_CONFIG);
    expect(spy).toBeCalled();
  });

  it('test addTracing', () => {
    const spy = jest.spyOn(InitLogger, 'addTracing');

    InitLogger.addTracing(
      app,
      COMMON_LOGGER_CONFIG.nameSpaceHook,
      appConfig().name
    );

    expect(spy).toBeCalled();
  });
});
