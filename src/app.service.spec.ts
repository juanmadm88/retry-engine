import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

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

describe('AppService ', () => {
  it('should expect to be defined', async () => {
    const appService: AppService = new AppService(new ConfigService());
    expect(appService).toBeDefined();
  });
  it('getHealth expected to be called', () => {
    const appService: AppService = new AppService(new ConfigService());
    const spy = jest.spyOn(appService, 'getHealth');
    appService.getHealth();
    expect(spy).toBeCalledTimes(1);
  });
});
