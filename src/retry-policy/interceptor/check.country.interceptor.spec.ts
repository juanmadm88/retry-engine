import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CheckCountryInterceptor } from './check.country.interceptor';

let interceptor: CheckCountryInterceptor;

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      CheckCountryInterceptor,
      {
        provide: ConfigService,
        useValue: {
          get: jest.fn((key: string) => {
            if (key === 'appConfig.country') {
              return 'pe';
            }
          })
        }
      }
    ]
  }).compile();

  interceptor = module.get<CheckCountryInterceptor>(CheckCountryInterceptor);
});

const executionContext = {
  switchToHttp: jest.fn().mockReturnThis(),
  getRequest: jest.fn().mockReturnThis(),
  getClass: jest.fn().mockReturnThis(),
  getHandler: jest.fn().mockReturnThis(),
  getArgs: jest.fn().mockReturnThis(),
  getArgByIndex: jest.fn().mockReturnThis(),
  switchToRpc: jest.fn().mockReturnThis(),
  getType: jest.fn().mockReturnThis(),
  switchToWs: jest.fn().mockReturnThis()
};

const callHandler = {
  handle: jest.fn()
};

describe('CheckCountryInterceptor ', () => {
  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });
  describe('CheckCountryInterceptor ', () => {
    it('should call next when header is correct ', async () => {
      (
        executionContext.switchToHttp().getRequest as jest.Mock<any, any>
      ).mockReturnValueOnce({
        headers: { 'x-flow-country': 'pe' },
        body: { data: 'mocked data' }
      });
      callHandler.handle.mockResolvedValueOnce('next handle');
      const actualValue = await interceptor.intercept(
        executionContext,
        callHandler
      );
      expect(actualValue).toBe('next handle');
      expect(callHandler.handle).toBeCalledTimes(1);
    });

    it('should return an especific error when header is empty ', async () => {
      (
        executionContext.switchToHttp().getRequest as jest.Mock<any, any>
      ).mockReturnValueOnce({
        headers: {},
        body: { data: 'mocked data' }
      });
      callHandler.handle.mockResolvedValueOnce('next handle');
      try {
        interceptor.intercept(executionContext, callHandler);
      } catch (e) {
        expect(e).toBeDefined();
        expect(e).toEqual(new BadRequestException('The country is mandatory'));
      }
    });

    it('should return an error when header is undefined ', async () => {
      (
        executionContext.switchToHttp().getRequest as jest.Mock<any, any>
      ).mockReturnValueOnce({
        body: { data: 'mocked data' }
      });
      callHandler.handle.mockResolvedValueOnce('next handle');
      try {
        interceptor.intercept(executionContext, callHandler);
      } catch (e) {
        expect(e).toBeDefined();
        expect(e).toEqual(new BadRequestException('The country is mandatory'));
      }
    });

    it('should return an especific error when header is incorrect ', async () => {
      (
        executionContext.switchToHttp().getRequest as jest.Mock<any, any>
      ).mockReturnValueOnce({
        headers: { 'x-flow-country': 'co' },
        body: { data: 'mocked data' }
      });
      callHandler.handle.mockResolvedValueOnce('next handle');
      try {
        interceptor.intercept(executionContext, callHandler);
      } catch (e) {
        expect(e).toBeDefined();
        expect(e).toEqual(
          new BadRequestException('The country is not correct')
        );
      }
    });
  });
});
