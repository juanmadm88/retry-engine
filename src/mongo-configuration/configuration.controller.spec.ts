import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurationController } from './configuration.controller';
import { MongoDBService } from '../database/mongodb-service/mongodb-service';
import { ConfigurationService } from './configuration.service';
import { ConfigService } from '@nestjs/config';
import { ConfigurationDTO } from './dtos';

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

describe('ConfigurationController', () => {
  let controller: ConfigurationController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigurationController],
      providers: [MongoDBService, ConfigurationService, ConfigService]
    }).compile();
    controller = module.get<ConfigurationController>(ConfigurationController);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('expect successfully created controller', async () => {
    expect(controller).toBeDefined();
  });
  it('expect sufesfully resolve when calling create method ', async () => {
    const body: ConfigurationDTO = new ConfigurationDTO({
      country: 'pe',
      timeSerie: { '1': '100' }
    });
    const configurationService = {
      create: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve({ status: 201 }))
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigurationController,
        ConfigService,
        {
          provide: ConfigurationService,
          useValue: configurationService
        }
      ]
    }).compile();
    const spy = jest.spyOn(configurationService, 'create');
    const controller: ConfigurationController =
      module.get<ConfigurationController>(ConfigurationController);
    await controller.create(body);
    expect(spy).toBeCalled();
  });
  it('expect sufesfully resolve when calling update method ', async () => {
    const body: ConfigurationDTO = new ConfigurationDTO({
      country: 'pe',
      timeSerie: { '1': '100' }
    });
    const configurationService = {
      update: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve({ status: 201 }))
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigurationController,
        ConfigService,
        {
          provide: ConfigurationService,
          useValue: configurationService
        }
      ]
    }).compile();
    const id = '1234';
    const spy = jest.spyOn(configurationService, 'update');
    const controller: ConfigurationController =
      module.get<ConfigurationController>(ConfigurationController);
    await controller.update(body, id);
    expect(spy).toBeCalled();
  });
  it('expect sufesfully resolve when calling get method ', async () => {
    const query: any = {
      country: 'pe'
    };
    const configurationService = {
      get: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve({ status: 201 }))
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigurationController,
        ConfigService,
        {
          provide: ConfigurationService,
          useValue: configurationService
        }
      ]
    }).compile();
    const spy = jest.spyOn(configurationService, 'get');
    const controller: ConfigurationController =
      module.get<ConfigurationController>(ConfigurationController);
    await controller.get(query);
    expect(spy).toBeCalled();
  });
});
