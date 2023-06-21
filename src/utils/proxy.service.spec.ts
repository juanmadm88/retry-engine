import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProxyService } from './proxy.service';
import { axiosClient } from '@payments/http-client';

jest.mock('@payments/http-client', () => ({
  axiosClient: {
    request: jest.fn()
  }
}));

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

const mockedAxios = axiosClient as jest.Mocked<typeof axiosClient>;

describe('ProxyService', () => {
  let proxy: ProxyService;
  beforeEach(async () => {
    (mockedAxios as jest.Mocked<typeof axiosClient>).request.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProxyService]
    }).compile();

    proxy = await module.get<ProxyService>(ProxyService);
  });
  it('expect to be defined', () => {
    expect(proxy).toBeDefined();
  });
  describe('doRequest Method', () => {
    it('expect response equals mocked data  ', async () => {
      const mockedResponse = { key: 'asd', id: 1 };
      const stringifyedResponse = JSON.stringify(mockedResponse);
      mockedAxios.request
        .mockImplementationOnce(() => Promise.resolve({ data: mockedResponse }))
        .mockImplementationOnce(() =>
          Promise.resolve({ data: stringifyedResponse })
        );
      const url = 'some url';
      const method = 'POST';
      const body = { attribute: 'some attribute' };
      const headers = { 'api-key': 'some api key' };
      const timeout = 4000;
      const result = await proxy.doRequest({
        url,
        method,
        body,
        headers,
        timeout
      });
      const result2 = await proxy.doRequest({
        url,
        method,
        body,
        headers,
        timeout
      });
      expect(result).toEqual(mockedResponse);
      expect(result2).toEqual(mockedResponse);
    });
    it('expect Http Bad Request Error when response is undefined ', async () => {
      const mockedResponse = undefined;
      mockedAxios.request.mockImplementationOnce(() =>
        Promise.resolve(mockedResponse)
      );
      const url = 'some url';
      const method = 'POST';
      const body = { attribute: 'some attribute' };
      const headers = { 'api-key': 'some api key' };
      const timeout = 4000;
      try {
        await proxy.doRequest({
          url,
          method,
          body,
          headers,
          timeout
        });
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
    it('expect an Error when method returns an error', async () => {
      mockedAxios.request.mockImplementationOnce(() =>
        Promise.reject({ status: 500, message: 'internal error message' })
      );
      const url = 'some url';
      const method = 'POST';
      const body = { attribute: 'some attribute' };
      const headers = { 'api-key': 'some api key' };
      const timeout = 4000;
      try {
        await proxy.doRequest({
          url,
          method,
          body,
          headers,
          timeout
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
