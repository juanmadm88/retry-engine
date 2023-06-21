import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from './logger.service';

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

describe('LoggerService', () => {
  let logger: LoggerService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService]
    }).compile();

    logger = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('expected error method to be called ', () => {
    const spy = jest.spyOn(logger, 'error');
    logger.error(undefined, undefined, undefined);
    expect(spy).toBeCalled();
  });

  it('expected warn method to be called ', () => {
    const spy = jest.spyOn(logger, 'warn');
    logger.warn(undefined, undefined, { colour: 'red' });
    expect(spy).toBeCalled();
  });
});
