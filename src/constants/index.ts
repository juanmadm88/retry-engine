import { TypeCall } from '../utils/common';

export class Constants {
  public static readonly REQUEST_TBK: string = 'RequestTransbank';
  public static readonly BUSINESS_NAMES: string[] = ['interop', 'bf'];
  public static readonly RESPONSE_TBK: string = 'ResponseTransbank';
  public static readonly REQUEST_TBK_MALL: string = 'RequestTbkMall';
  public static readonly RESPONSE_TBK_MALL: string = 'ResponseTbkMall';
  public static readonly REQUEST_REDEBAN: string = 'RequestRedeban';
  public static readonly RESPONSE_REDEBAN: string = 'ResponseRedeban';
  public static readonly REQUEST_SFC: string = 'RequestSfc';
  public static readonly RESPONSE_SFC: string = 'ResponseSfc';
  public static readonly REQUEST_CREDIBANCO: string = 'RequestCredibanco';
  public static readonly RESPONSE_CREDIBANCO: string = 'ResponseCredibanco';
  public static readonly REQUEST_CMR: string = 'RequestCMR';
  public static readonly RESPONSE_CMR: string = 'ResponseCMR';
  public static readonly REQUEST_BF: string = 'RequestBF';
  public static readonly RESPONSE_BF: string = 'ResponseBF';
  public static readonly REQUEST_INTEROP: string = 'RequestInterOp';
  public static readonly RESPONSE_INTEROP: string = 'ResponseInterOp';
  public static readonly ERROR_INVALID_RESPONSE: string =
    'ERROR_INVALID_RESPONSE';
  public static readonly statusEnum: string[] = [
    'AWAITING',
    'FINISHED',
    'ERROR',
    'PENDING_DP',
    'PENDIG_DF',
    'TECHNICAL_REVERSE'
  ];
  public static readonly countryEnum: string[] = ['pe', 'cl', 'co'];
  public static readonly PROXY_SERVICE = {
    DO_REQUEST_METHOD: {
      NAME: 'doRequest'
    }
  };
  public static readonly BASE_CONTROLLER = {
    CREATE_METHOD: {
      NAME: 'create'
    }
  };
  public static readonly CREATE_TRANSACTION_SERVICE = {
    CREATE_METHOD: {
      NAME: 'create'
    }
  };
  public static readonly TBK_MALL_SERVICE = {
    GET_METHOD: {
      NAME: 'getTokenByReconciliationId',
      NOT_FOUND_ERROR_CODE: 'NOT_FOUND_TOKEN_TECH_REVERSE'
    }
  };
  public static readonly typesCall: object = {
    transbank: { request: this.REQUEST_TBK, response: this.RESPONSE_TBK },
    tbk_mall: {
      request: this.REQUEST_TBK_MALL,
      response: this.RESPONSE_TBK_MALL
    },
    redeban: { request: this.REQUEST_REDEBAN, response: this.RESPONSE_REDEBAN },
    sfc: { request: this.REQUEST_SFC, response: this.RESPONSE_SFC },
    credibanco: {
      request: this.REQUEST_CREDIBANCO,
      response: this.RESPONSE_CREDIBANCO
    },
    bf: {
      request: this.REQUEST_BF,
      response: this.RESPONSE_BF
    },
    interop: {
      request: this.REQUEST_INTEROP,
      response: this.RESPONSE_INTEROP
    }
  };
  public static readonly cmrTypeCall: TypeCall = {
    request: this.REQUEST_CMR,
    response: this.RESPONSE_CMR
  };
  public static readonly PATHS: object = {
    TransactionLogDTO: 'create-transaction',
    ConfigurationDTO: 'mongo-configuration'
  };
  public static dtosDictionary: object = {
    TransactionLog: 'TransactionLogDTO',
    Configuration: 'ConfigurationDTO'
  };
}
