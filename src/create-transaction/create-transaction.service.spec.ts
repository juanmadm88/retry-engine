import { Test, TestingModule } from '@nestjs/testing';
import { ProxyService } from '../utils/proxy.service';
import { CreateTransactionService } from './create-transaction.service';
import { MongoDBService } from '../database/mongodb-service/mongodb-service';
import { TbkMallService } from '../tbk-mall/tbk-mall.service';
import { ConfigService } from '@nestjs/config';
import { throwError } from 'rxjs';
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

describe('CreateTransactionService', () => {
  const tbkMallServiceMocked = {
    getTokenByReconciliationId: jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve('some_token'))
  };
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('expect successfully created service', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        ProxyService,
        MongoDBService,
        TbkMallService,
        ConfigService,
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
        },
        {
          provide: ConfigurationService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    expect(service).not.toBeUndefined();
  });
  it('expect response to be defined ', async () => {
    const mockedConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'appConfig.failCodes') {
          return ['408', '500', '502'];
        }
        if (key === 'appConfig.timeSerie') {
          return { 1: 60, 2: 60, 3: 60, 4: 60 };
        }
        if (key === 'appConfig.timeoutCodes') {
          return ['ESOCKETTIMEDOUT'];
        }
        if (key === 'appConfig.api_tin.allowedCodes') {
          return ['2', '3', '5'];
        }
        if (key === 'appConfig.api_tin.allowedCodesToRetry') {
          return ['3', '5'];
        }
      })
    };
    const proxyServiceMocked = {
      doRequest: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          result: {}
        })
      )
    };
    const mongoDBService = {
      saveData: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          data: {}
        })
      )
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProxyService, useValue: proxyServiceMocked },
        { provide: MongoDBService, useValue: mongoDBService },
        { provide: TbkMallService, useValue: tbkMallServiceMocked },
        { provide: ConfigService, useValue: mockedConfigService },
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
        },
        {
          provide: ConfigurationService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    const request: any = {
      headers: {
        'x-flow-timeout': 5000
      },
      options: {
        body: {
          metadata: {
            transaction: {
              business: {
                name: 'tbk'
              },
              reconciliation_id: '34563'
            }
          },
          transaction_type: 'SALE',
          transaction: {
            unique_id: '123423'
          }
        }
      }
    };
    const response = await service.create(request);
    expect(response).toBeDefined();
  });
  it('expect an Error when mongoDB Service fails ', async () => {
    const mockedConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'appConfig.failCodes') {
          return ['408', '500', '502'];
        }
        if (key === 'appConfig.timeSerie') {
          return { 1: 60, 2: 60, 3: 60, 4: 60 };
        }
        if (key === 'appConfig.timeoutCodes') {
          return ['ESOCKETTIMEDOUT'];
        }
        if (key === 'appConfig.api_tin') {
          return { endoint: 'localhost:8080', api_key: 'sarasa' };
        }
      })
    };
    const proxyServiceMocked = {
      doRequest: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          data: {}
        })
      )
    };
    const mongoDBService = {
      saveData: jest.fn().mockImplementationOnce(() =>
        Promise.reject({
          response: { status: 400 }
        })
      )
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProxyService, useValue: proxyServiceMocked },
        { provide: MongoDBService, useValue: mongoDBService },
        { provide: TbkMallService, useValue: tbkMallServiceMocked },
        { provide: ConfigService, useValue: mockedConfigService },
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
        },
        {
          provide: ConfigurationService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    const request: any = {
      options: {
        body: {
          metadata: {
            transaction: {
              business: {
                name: 'bf'
              },
              reconciliation_id: '34563'
            }
          },
          transaction_type: 'SALE',
          transaction: {
            unique_id: '123423'
          }
        },
        headers: {
          'x-flow-timeout': 5000
        }
      }
    };
    const spyApiTin = jest.spyOn(service as any, 'buildApiTin');
    try {
      await service.create(request);
    } catch (error) {
      expect(error).toBeDefined();
      expect(spyApiTin).toBeCalled();
    }
  });
  it('expect tbkMallService to be called', async () => {
    const mockedConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'appConfig.failCodes') {
          return ['408', '500', '502'];
        }
        if (key === 'appConfig.timeSerie') {
          return { 1: 60, 2: 60, 3: 60, 4: 60 };
        }
        if (key === 'appConfig.timeoutCodes') {
          return ['ESOCKETTIMEDOUT'];
        }
        if (key === 'appConfig.api_tin') {
          return { endoint: 'localhost:8080', api_key: 'sarasa' };
        }
      })
    };
    const proxyServiceMocked = {
      doRequest: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          result: {}
        })
      )
    };
    const mongoDBService = {
      saveData: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          data: {}
        })
      )
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProxyService, useValue: proxyServiceMocked },
        { provide: MongoDBService, useValue: mongoDBService },
        { provide: TbkMallService, useValue: tbkMallServiceMocked },
        { provide: ConfigService, useValue: mockedConfigService },
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
        },
        {
          provide: ConfigurationService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    const request: any = {
      headers: {
        'x-flow-timeout': 5000
      },
      options: {
        body: {
          metadata: {
            transaction: {
              business: {
                name: 'tbk_mall'
              },
              reconciliation_id: '34563'
            }
          },
          transaction_type: 'SALE',
          transaction: {
            unique_id: '123423'
          }
        }
      }
    };
    const spy = jest.spyOn(service as any, 'buildTbkMallTransaction');
    const response = await service.create(request);
    expect(response).toBeDefined();
    expect(spy).toBeCalled();
  });
  it('expect buildTbkTransaction to be called', async () => {
    const mockedConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'appConfig.failCodes') {
          return ['408', '500', '502'];
        }
        if (key === 'appConfig.timeSerie') {
          return { 1: 60, 2: 60, 3: 60, 4: 60 };
        }
        if (key === 'appConfig.timeoutCodes') {
          return ['ESOCKETTIMEDOUT'];
        }
        if (key === 'appConfig.api_tin.allowedCodes') {
          return ['2', '3', '5'];
        }
        if (key === 'appConfig.api_tin.allowedCodesToRetry') {
          return ['3', '5'];
        }
      })
    };
    const proxyServiceMocked = {
      doRequest: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          result: {}
        })
      )
    };
    const mongoDBService = {
      saveData: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          data: {}
        })
      )
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProxyService, useValue: proxyServiceMocked },
        { provide: MongoDBService, useValue: mongoDBService },
        { provide: TbkMallService, useValue: tbkMallServiceMocked },
        { provide: ConfigService, useValue: mockedConfigService },
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
        },
        {
          provide: ConfigurationService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    const request: any = {
      headers: {
        'x-flow-timeout': 5000
      },
      options: {
        body: {
          metadata: {
            transaction: {
              business: {
                name: 'transbank'
              },
              reconciliation_id: '34563'
            }
          },
          transaction_type: 'SALE',
          transaction: {
            unique_id: '123423'
          }
        }
      }
    };
    const spy = jest.spyOn(service as any, 'buildTbkTransaction');
    const response = await service.create(request);
    expect(response).toBeDefined();
    expect(spy).toBeCalled();
  });
  it('expect handlerError to be called', async () => {
    const proxyServiceMocked = {
      doRequest: jest.fn().mockImplementationOnce(() =>
        Promise.reject({
          response: { statusCode: 405 }
        })
      )
    };
    const mockedConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'appConfig.failCodes') {
          return ['408', '500', '502'];
        }
        if (key === 'appConfig.timeSerie') {
          return { 1: 60, 2: 60, 3: 60, 4: 60 };
        }
        if (key === 'appConfig.timeoutCodes') {
          return ['ESOCKETTIMEDOUT'];
        }
        if (key === 'appConfig.api_tin.allowedCodes') {
          return ['2', '3', '5'];
        }
        if (key === 'appConfig.api_tin.allowedCodesToRetry') {
          return ['3', '5'];
        }
      })
    };
    const mongoDBService = {
      saveData: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          data: {}
        })
      )
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProxyService, useValue: proxyServiceMocked },
        { provide: MongoDBService, useValue: mongoDBService },
        { provide: TbkMallService, useValue: tbkMallServiceMocked },
        { provide: ConfigService, useValue: mockedConfigService },
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
        },
        {
          provide: ConfigurationService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    const request: any = {
      headers: {
        'x-flow-timeout': 5000
      },
      options: {
        body: {
          metadata: {
            transaction: {
              business: {
                name: 'transbank'
              },
              reconciliation_id: '34563'
            }
          },
          transaction_type: 'SALE',
          transaction: {
            unique_id: '123423'
          }
        }
      }
    };
    const spy = jest.spyOn(service as any, 'handlerError');
    try {
      await service.create(request);
    } catch (error) {
      expect(error).toBeDefined();
      expect(spy).toBeCalled();
    }
  });
  it('expect calling saveData  after handlerError it´s been called', async () => {
    const proxyServiceMocked = {
      doRequest: jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.reject({ code: 'ESOCKETTIMEDOUT' })
        )
    };
    const mockedConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'appConfig.failCodes') {
          return ['408', '500', '502'];
        }
        if (key === 'appConfig.timeSerie') {
          return { 1: 60, 2: 60, 3: 60, 4: 60 };
        }
        if (key === 'appConfig.timeoutCodes') {
          return ['ESOCKETTIMEDOUT'];
        }
      })
    };
    const mongoDBService = {
      saveData: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          data: {}
        })
      )
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProxyService, useValue: proxyServiceMocked },
        { provide: MongoDBService, useValue: mongoDBService },
        { provide: TbkMallService, useValue: tbkMallServiceMocked },
        { provide: ConfigService, useValue: mockedConfigService },
        {
          provide: 'RABBIT_PRODUCER',
          useValue: {
            send: jest.fn()
          }
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: {
            get: jest.fn().mockImplementation(() => {
              return [
                {
                  '1': '100'
                }
              ];
            }),
            set: jest.fn()
          }
        },
        {
          provide: ConfigurationService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    const request: any = {
      headers: {
        'x-flow-timeout': 5000
      },
      options: {
        body: {
          metadata: {
            transaction: {
              business: {
                name: 'transbank'
              },
              reconciliation_id: '34563'
            }
          },
          transaction_type: 'SALE',
          transaction: {
            unique_id: '123423'
          }
        }
      }
    };
    const spyHandlerError = jest.spyOn(service as any, 'handlerError');
    const spyMongoService = jest.spyOn(mongoDBService, 'saveData');
    try {
      await service.create(request);
    } catch (error) {
      expect(error).toBeDefined();
      expect(spyHandlerError).toBeCalled();
      expect(spyMongoService).toBeCalled();
    }
  });
  it('expect buildSfcTransaction to be called', async () => {
    const mockedConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'appConfig.failCodes') {
          return ['408', '500', '502'];
        }
        if (key === 'appConfig.timeSerie') {
          return { 1: 60, 2: 60, 3: 60, 4: 60 };
        }
        if (key === 'appConfig.timeoutCodes') {
          return ['ESOCKETTIMEDOUT'];
        }
        if (key === 'appConfig.api_tin.allowedCodes') {
          return ['2', '3', '5'];
        }
        if (key === 'appConfig.api_tin.allowedCodesToRetry') {
          return ['3', '5'];
        }
      })
    };
    const proxyServiceMocked = {
      doRequest: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          result: {}
        })
      )
    };
    const mongoDBService = {
      saveData: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          data: {}
        })
      )
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProxyService, useValue: proxyServiceMocked },
        { provide: MongoDBService, useValue: mongoDBService },
        { provide: TbkMallService, useValue: tbkMallServiceMocked },
        { provide: ConfigService, useValue: mockedConfigService },
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
        },
        {
          provide: ConfigurationService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    const request: any = {
      headers: {
        'x-flow-timeout': 5000
      },
      options: {
        body: {
          metadata: {
            transaction: {
              business: {
                name: 'sfc'
              },
              reconciliation_id: '34563'
            }
          },
          transaction_type: 'SALE',
          transaction: {
            unique_id: '123423'
          }
        }
      }
    };
    const spy = jest.spyOn(service as any, 'buildSfcTransaction');
    const response = await service.create(request);
    expect(response).toBeDefined();
    expect(spy).toBeCalled();
  });
  it('expect an error when getTokenByReconciliationId is called', async () => {
    const proxyServiceMocked = {
      doRequest: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          result: {}
        })
      )
    };
    const tbkMallServiceMocked = {
      getTokenByReconciliationId: jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.reject({ response: { status: 500 } })
        )
    };
    const mongoDBService = {
      saveData: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          data: {}
        })
      )
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProxyService, useValue: proxyServiceMocked },
        { provide: MongoDBService, useValue: mongoDBService },
        { provide: TbkMallService, useValue: tbkMallServiceMocked },
        ConfigService,
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
        },
        {
          provide: ConfigurationService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    const request: any = {
      headers: {
        'x-flow-timeout': 5000
      },
      options: {
        body: {
          metadata: {
            transaction: {
              business: {
                name: 'tbk_mall'
              },
              reconciliation_id: '34563'
            }
          },
          transaction_type: 'SALE',
          transaction: {
            unique_id: '123423'
          }
        }
      }
    };
    const spy = jest.spyOn(service as any, 'buildTbkMallTransaction');
    try {
      await service.create(request);
    } catch (error) {
      expect(error).toBeDefined();
      expect(spy).toBeCalled();
    }
  });
  it('expect mongoDBService.getData to be called', async () => {
    const proxyServiceMocked = {
      doRequest: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          result: {}
        })
      )
    };
    const tbkMallServiceMocked = {
      getTokenByReconciliationId: jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.reject({ response: { status: 500 } })
        )
    };
    const mongoDBService = {
      updateData: jest
        .fn()
        .mockImplementation(() => Promise.reject({ code: 'some code' })),
      getData: jest.fn().mockImplementationOnce(() =>
        Promise.resolve([
          {
            _id: '1234',
            created_at: 'Wed May 31 2023 18:35:06',
            getId: jest.fn(),
            getTrsUniqueId: jest.fn(),
            getData: jest.fn().mockImplementation(() => {
              return {
                options: {
                  body: {
                    metadata: {
                      transaction: {
                        business: {
                          name: 'tbk'
                        },
                        reconciliation_id: '34563'
                      }
                    },
                    transaction_type: 'SALE',
                    transaction: {
                      unique_id: '123423'
                    }
                  },
                  headers: {
                    'x-flow-timeout': 5000
                  }
                }
              };
            }),
            getTraceId: jest.fn(),
            getCreatedAt: jest.fn(),
            getRetries: jest.fn().mockImplementationOnce(() => {
              return 2;
            }),
            getNextExecution: jest.fn()
          }
        ])
      )
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProxyService, useValue: proxyServiceMocked },
        { provide: MongoDBService, useValue: mongoDBService },
        { provide: TbkMallService, useValue: tbkMallServiceMocked },
        ConfigService,
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
        },
        {
          provide: ConfigurationService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    const spy = jest.spyOn(mongoDBService as any, 'getData');
    await service.retry();
    expect(spy).toBeCalled();
  });
  it('expect an Error when mongoDBService.getData is called', async () => {
    const proxyServiceMocked = {
      doRequest: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          result: {}
        })
      )
    };
    const tbkMallServiceMocked = {
      getTokenByReconciliationId: jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.reject({ response: { status: 500 } })
        )
    };
    const mongoDBService = {
      getData: jest.fn().mockImplementationOnce(() =>
        Promise.reject({
          code: 'some error'
        })
      )
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProxyService, useValue: proxyServiceMocked },
        { provide: MongoDBService, useValue: mongoDBService },
        { provide: TbkMallService, useValue: tbkMallServiceMocked },
        ConfigService,
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
        },
        {
          provide: ConfigurationService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    const spy = jest.spyOn(mongoDBService as any, 'getData');
    try {
      await service.retry();
    } catch (error) {
      expect(error).toBeDefined();
      expect(spy).toBeCalled();
    }
  });
  it('expect reprocessTransaction to be called', async () => {
    const record = {
      _id: '1234',
      created_at: 'Wed May 31 2023 18:35:06',
      getId: jest.fn(),
      getTrsUniqueId: jest.fn(),
      getData: jest.fn().mockImplementation(() => {
        return {
          options: {
            body: {
              metadata: {
                transaction: {
                  business: {
                    name: 'tbk'
                  },
                  reconciliation_id: '34563'
                }
              },
              transaction_type: 'SALE',
              transaction: {
                unique_id: '123423'
              }
            },
            headers: {
              'x-flow-timeout': 5000
            }
          }
        };
      }),
      getTraceId: jest.fn(),
      getCreatedAt: jest.fn(),
      getRetries: jest.fn().mockImplementation(() => {
        return 5;
      }),
      getNextExecution: jest.fn()
    };
    const proxyServiceMocked = {
      doRequest: jest.fn().mockImplementationOnce(() =>
        Promise.reject({
          response: { status: 405 }
        })
      )
    };
    const mockedConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'appConfig.failCodes') {
          return ['408', '500', '502'];
        }
        if (key === 'appConfig.timeSerie') {
          return { 1: 60, 2: 60, 3: 60, 4: 60 };
        }
        if (key === 'appConfig.timeoutCodes') {
          return ['ESOCKETTIMEDOUT'];
        }
      })
    };
    const mongoDBService = {
      getData: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve([record, record]))
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProxyService, useValue: proxyServiceMocked },
        { provide: MongoDBService, useValue: mongoDBService },
        { provide: TbkMallService, useValue: tbkMallServiceMocked },
        { provide: ConfigService, useValue: mockedConfigService },
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
        },
        {
          provide: ConfigurationService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    const spy = jest
      .spyOn(service as any, 'reprocessTransaction')
      .mockImplementationOnce(() => Promise.resolve({ data: {} }))
      .mockImplementationOnce(() => Promise.reject({ error: {} }));
    await service.retry();
    expect(spy).toBeCalled();
  });
  it('expect response to be defined when calling reprocessTransaction method ', async () => {
    const proxyServiceMocked = {
      doRequest: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          data: {}
        })
      )
    };
    const mockedConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'appConfig.failCodes') {
          return ['408', '500', '502'];
        }
        if (key === 'appConfig.timeSerie') {
          return { 1: 60, 2: 60, 3: 60, 4: 60 };
        }
        if (key === 'appConfig.timeoutCodes') {
          return ['ESOCKETTIMEDOUT'];
        }
      })
    };
    const record = {
      trace_id: '1234',
      _id: '68695',
      getId: jest.fn(),
      getTrsUniqueId: jest.fn(),
      getData: jest.fn().mockImplementation(() => {
        return {
          options: {
            body: {
              metadata: {
                transaction: {
                  business: {
                    name: 'tbk'
                  },
                  reconciliation_id: '34563'
                }
              },
              transaction_type: 'SALE',
              transaction: {
                unique_id: '123423'
              }
            },
            headers: {
              'x-flow-timeout': 5000
            }
          }
        };
      }),
      getTraceId: jest.fn(),
      getCreatedAt: jest.fn(),
      getRetries: jest.fn(),
      getNextExecution: jest.fn()
    };
    const mongoDBService = {
      getData: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve([record])),
      updateData: jest.fn(),
      saveData: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProxyService, useValue: proxyServiceMocked },
        { provide: MongoDBService, useValue: mongoDBService },
        { provide: TbkMallService, useValue: tbkMallServiceMocked },
        { provide: ConfigService, useValue: mockedConfigService },
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
        },
        {
          provide: ConfigurationService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    await service.retry();
  });
  it('expect handlerErrorForReprocessTransaction expected to be called ', async () => {
    const proxyServiceMocked = {
      doRequest: jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.reject({ code: 'ESOCKETTIMEDOUT' })
        )
        .mockImplementationOnce(() =>
          Promise.reject({ response: { statusCode: 409 } })
        )
    };
    const mockedConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'appConfig.failCodes') {
          return ['408', '500', '502'];
        }
        if (key === 'appConfig.timeSerie') {
          return { 1: 60, 2: 60, 3: 60, 4: 60 };
        }
        if (key === 'appConfig.timeoutCodes') {
          return ['ESOCKETTIMEDOUT'];
        }
      })
    };
    const record = {
      trace_id: '1234',
      created_at: new Date(),
      getId: jest.fn(),
      getTrsUniqueId: jest.fn(),
      getData: jest.fn().mockImplementation(() => {
        return {
          options: {
            body: {
              metadata: {
                transaction: {
                  business: {
                    name: 'tbk'
                  },
                  reconciliation_id: '34563'
                }
              },
              transaction_type: 'SALE',
              transaction: {
                unique_id: '123423'
              }
            },
            headers: {
              'x-flow-timeout': 5000
            }
          }
        };
      }),
      getTraceId: jest.fn(),
      getCreatedAt: jest.fn(),
      getRetries: jest.fn().mockImplementation(() => {
        return 1;
      }),
      getNextExecution: jest.fn(),
      _id: '68695'
    };
    const mongoDBService = {
      getData: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve([record, record])),
      updateData: jest.fn(),
      saveData: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProxyService, useValue: proxyServiceMocked },
        { provide: MongoDBService, useValue: mongoDBService },
        { provide: TbkMallService, useValue: tbkMallServiceMocked },
        { provide: ConfigService, useValue: mockedConfigService },
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
        },
        {
          provide: ConfigurationService,
          useValue: {
            get: jest.fn().mockImplementation(() => {
              return [];
            })
          }
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    await service.retry();
  });
  it('expect reprocessTransaction not to be called', async () => {
    const proxyServiceMocked = {
      doRequest: jest.fn().mockImplementationOnce(() =>
        Promise.reject({
          response: { status: 405 }
        })
      )
    };
    const mockedConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'appConfig.failCodes') {
          return ['408', '500', '502'];
        }
        if (key === 'appConfig.timeSerie') {
          return { 1: 60, 2: 60, 3: 60, 4: 60 };
        }
        if (key === 'appConfig.timeoutCodes') {
          return ['ESOCKETTIMEDOUT'];
        }
      })
    };
    const mongoDBService = {
      getData: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve(undefined))
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProxyService, useValue: proxyServiceMocked },
        { provide: MongoDBService, useValue: mongoDBService },
        { provide: TbkMallService, useValue: tbkMallServiceMocked },
        { provide: ConfigService, useValue: mockedConfigService },
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
        },
        {
          provide: ConfigurationService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    const spy = jest
      .spyOn(service as any, 'reprocessTransaction')
      .mockImplementationOnce(() => Promise.resolve({ data: {} }))
      .mockImplementationOnce(() => Promise.reject({ error: {} }));
    await service.retry();
    expect(spy).toBeCalledTimes(0);
  });
  it('expect handlerError to be called when api tin returns 200 Ok with status.code equals "3" ', async () => {
    const proxyServiceMocked = {
      doRequest: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          status: { code: 3, description: 'some description' }
        })
      )
    };
    const mockedConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'appConfig.failCodes') {
          return ['408', '500', '502'];
        }
        if (key === 'appConfig.timeSerie') {
          return { 1: 60, 2: 60, 3: 60, 4: 60 };
        }
        if (key === 'appConfig.timeoutCodes') {
          return ['ESOCKETTIMEDOUT'];
        }
        if (key === 'appConfig.api_tin.allowedCodes') {
          return ['2', '3', '5'];
        }
        if (key === 'appConfig.api_tin.allowedCodesToRetry') {
          return ['3', '5'];
        }
        if (key === 'appConfig.api_tin') {
          return { endpoint: 'url', api_key: 'apiKey' };
        }
      })
    };
    const mongoDBService = {
      saveData: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          data: {}
        })
      )
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProxyService, useValue: proxyServiceMocked },
        { provide: MongoDBService, useValue: mongoDBService },
        { provide: TbkMallService, useValue: tbkMallServiceMocked },
        { provide: ConfigService, useValue: mockedConfigService },
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
        },
        {
          provide: ConfigurationService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    const request: any = {
      options: {
        body: {
          metadata: {
            transaction: {
              business: {
                name: 'interop'
              },
              reconciliation_id: '34563'
            }
          },
          transaction_type: 'SALE',
          transaction: {
            unique_id: '123423'
          }
        },
        headers: {
          'x-flow-country': 'pe'
        }
      }
    };
    const spy = jest.spyOn(service as any, 'handlerError');
    try {
      await service.create(request);
    } catch (error) {
      expect(error).toBeDefined();
      expect(spy).toBeCalled();
    }
  });
  it('expect an Error when publishToTransactionProcessor method fails ', async () => {
    const mockedConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'appConfig.failCodes') {
          return ['408', '500', '502'];
        }
        if (key === 'appConfig.timeSerie') {
          return { 1: 60, 2: 60, 3: 60, 4: 60 };
        }
        if (key === 'appConfig.timeoutCodes') {
          return ['ESOCKETTIMEDOUT'];
        }
        if (key === 'appConfig.api_tin') {
          return { endoint: 'localhost:8080', api_key: 'sarasa' };
        }
      })
    };
    const proxyServiceMocked = {
      doRequest: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          result: {}
        })
      )
    };
    const mongoDBService = {
      saveData: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          data: {}
        })
      )
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProxyService, useValue: proxyServiceMocked },
        { provide: MongoDBService, useValue: mongoDBService },
        { provide: TbkMallService, useValue: tbkMallServiceMocked },
        { provide: ConfigService, useValue: mockedConfigService },
        {
          provide: 'RABBIT_PRODUCER',
          useValue: {
            send: jest
              .fn()
              .mockReturnValue(throwError(() => new Error('fallo')))
          }
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: {
            get: jest.fn(),
            set: jest.fn()
          }
        },
        {
          provide: ConfigurationService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    const request: any = {
      headers: {
        'x-flow-timeout': 5000
      },
      options: {
        body: {
          metadata: {
            transaction: {
              business: {
                name: 'tbk_mall'
              },
              reconciliation_id: '34563'
            }
          },
          transaction_type: 'SALE',
          transaction: {
            unique_id: '123423'
          }
        }
      }
    };
    const spy = jest.spyOn(service as any, 'buildTbkMallTransaction');
    try {
      await service.create(request);
    } catch (error) {
      expect(error).toBeDefined();
      expect(spy).toBeCalled();
    }
  });
  it('expect configurationService to be called', async () => {
    const proxyServiceMocked = {
      doRequest: jest.fn().mockImplementationOnce(() =>
        Promise.reject({
          response: { statusCode: 408 }
        })
      )
    };
    const mockedConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'appConfig.failCodes') {
          return ['408', '500', '502'];
        }
        if (key === 'appConfig.timeSerie') {
          return { 1: 60, 2: 60, 3: 60, 4: 60 };
        }
        if (key === 'appConfig.timeoutCodes') {
          return ['ESOCKETTIMEDOUT'];
        }
        if (key === 'appConfig.api_tin.allowedCodes') {
          return ['2', '3', '5'];
        }
        if (key === 'appConfig.api_tin.allowedCodesToRetry') {
          return ['3', '5'];
        }
      })
    };
    const mockedConfigurationService = {
      get: jest.fn().mockImplementation(() => {
        return [{ timeSerie: { '1': '400' } }];
      })
    };
    const mongoDBService = {
      saveData: jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          data: {}
        })
      )
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProxyService, useValue: proxyServiceMocked },
        { provide: MongoDBService, useValue: mongoDBService },
        { provide: TbkMallService, useValue: tbkMallServiceMocked },
        { provide: ConfigService, useValue: mockedConfigService },
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
        },
        {
          provide: ConfigurationService,
          useValue: mockedConfigurationService
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    const request: any = {
      headers: {
        'x-flow-timeout': 5000
      },
      options: {
        body: {
          metadata: {
            transaction: {
              business: {
                name: 'transbank'
              },
              reconciliation_id: '34563'
            }
          },
          transaction_type: 'SALE',
          transaction: {
            unique_id: '123423'
          }
        }
      }
    };
    const spy = jest.spyOn(mockedConfigurationService, 'get');
    try {
      await service.create(request);
    } catch (error) {
      expect(error).toBeDefined();
      expect(spy).toBeCalled();
    }
  });
  it('expect buildSeconds method not being called, when number of retries are larger than allowed ', async () => {
    const proxyServiceMocked = {
      doRequest: jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.reject({ code: 'ESOCKETTIMEDOUT' })
        )
    };
    const mockedConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'appConfig.failCodes') {
          return ['408', '500', '502'];
        }
        if (key === 'appConfig.timeSerie') {
          return { 1: 60, 2: 60, 3: 60, 4: 60 };
        }
        if (key === 'appConfig.timeoutCodes') {
          return ['ESOCKETTIMEDOUT'];
        }
      })
    };
    const record = {
      trace_id: '1234',
      created_at: new Date(),
      getId: jest.fn(),
      getTrsUniqueId: jest.fn(),
      getData: jest.fn().mockImplementation(() => {
        return {
          options: {
            body: {
              metadata: {
                transaction: {
                  business: {
                    name: 'tbk'
                  },
                  reconciliation_id: '34563'
                }
              },
              transaction_type: 'SALE',
              transaction: {
                unique_id: '123423'
              }
            },
            headers: {
              'x-flow-timeout': 5000
            }
          }
        };
      }),
      getTraceId: jest.fn(),
      getCreatedAt: jest.fn(),
      getRetries: jest.fn().mockImplementation(() => {
        return 5;
      }),
      getNextExecution: jest.fn(),
      _id: '68695'
    };
    const mongoDBService = {
      getData: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve([record, record])),
      updateData: jest.fn(),
      saveData: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProxyService, useValue: proxyServiceMocked },
        { provide: MongoDBService, useValue: mongoDBService },
        { provide: TbkMallService, useValue: tbkMallServiceMocked },
        { provide: ConfigService, useValue: mockedConfigService },
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
        },
        {
          provide: ConfigurationService,
          useValue: {
            get: jest.fn().mockImplementation(() => {
              return [];
            })
          }
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    const spy = jest.spyOn(service as any, 'buildSeconds');
    await service.retry();
    expect(spy).not.toBeCalled();
  });
  it('expect an Error after calling saveData  when handlerError it´s been called', async () => {
    const proxyServiceMocked = {
      doRequest: jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.reject({ code: 'ESOCKETTIMEDOUT' })
        )
    };
    const mockedConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'appConfig.failCodes') {
          return ['408', '500', '502'];
        }
        if (key === 'appConfig.timeSerie') {
          return { 1: 60, 2: 60, 3: 60, 4: 60 };
        }
        if (key === 'appConfig.timeoutCodes') {
          return ['ESOCKETTIMEDOUT'];
        }
      })
    };
    const mongoDBService = {
      saveData: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionService,
        { provide: ProxyService, useValue: proxyServiceMocked },
        { provide: MongoDBService, useValue: mongoDBService },
        { provide: TbkMallService, useValue: tbkMallServiceMocked },
        { provide: ConfigService, useValue: mockedConfigService },
        {
          provide: 'RABBIT_PRODUCER',
          useValue: {
            send: jest.fn()
          }
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: {
            get: jest
              .fn()
              .mockImplementation(() =>
                Promise.reject({ error: { code: 'some code' } })
              ),
            set: jest.fn()
          }
        },
        {
          provide: ConfigurationService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();
    const service: CreateTransactionService =
      module.get<CreateTransactionService>(CreateTransactionService);
    const request: any = {
      headers: {
        'x-flow-timeout': 5000
      },
      options: {
        body: {
          metadata: {
            transaction: {
              business: {
                name: 'transbank'
              },
              reconciliation_id: '34563'
            }
          },
          transaction_type: 'SALE',
          transaction: {
            unique_id: '123423'
          }
        }
      }
    };
    const spyHandlerError = jest.spyOn(service as any, 'handlerError');
    const spyMongoService = jest.spyOn(mongoDBService, 'saveData');
    try {
      await service.create(request);
    } catch (error) {
      expect(error).toBeDefined();
      expect(spyHandlerError).toBeCalled();
      expect(spyMongoService).not.toBeCalled();
    }
  });
});
