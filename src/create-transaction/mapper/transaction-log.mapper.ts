import { TransactionLogDTO } from '../dtos/transaction-log.dto';
import * as moment from 'moment';
import { get } from 'lodash';
import buildError from '../../utils/build-error';
export class TransactionLogMapper {
  private static buildRequest = (args: any): TransactionLogDTO => {
    const paramaters: any = {};
    const request: TransactionLogDTO = new TransactionLogDTO(paramaters);
    request.setTrsType(get(args.data, 'options.body.transaction_type'));
    request.setTypeCall(args.typeCall);
    request.setTrsUniqueId(
      get(args.data, 'options.body.transaction.unique_id')
    );
    request.setTrsDatetime(
      moment(get(args.data, 'options.body.transaction.datetime')).format(
        'YYYY-MM-DD HH:mm:ss'
      )
    );
    request.setTrsAmountTotal(
      get(args.data, 'options.body.transaction.amount.total')
    );
    request.setPaymentMethod(
      get(
        args.data,
        'options.body.transaction.original_transaction.payment_method',
        get(args.data, 'options.body.metadata.payment_method')
      )
    );
    request.setAcquirer(
      get(
        args.data,
        'options.body.transaction.original_transaction.transaction.acquirer'
      )
    );
    request.setAcquirerUniqueId(
      get(
        args.data,
        'options.body.transaction.original_transaction.transaction.acquirer_unique_id'
      )
    );
    request.setResponseCode(
      get(
        args.data,
        'options.body.transaction.original_transaction.response_code'
      )
    );
    request.setAuthorizationCode(
      get(
        args.data,
        'options.body.transaction.original_transaction.transaction.authorization_code'
      )
    );
    request.setStatus(
      this.getStatus(
        get(args.data, 'options.body.metadata.transaction.technical_reverse')
      )
    );
    request.setRetries(get(args.data, 'retries', 1));
    request.setToBeReprocessed(get(args.data, 'to_be_reprocessed', false));
    request.setData(args.data);
    request.setTraceId(args.traceId);
    return request;
  };

  private static buildResponse = (args: any): TransactionLogDTO => {
    const parameters: any = {};
    const response: TransactionLogDTO = new TransactionLogDTO(parameters);
    const error: object = buildError(args.error);
    response.setTrsType(get(args.data, 'transaction_type'));
    response.setTypeCall(args.typeCall);
    response.setTrsUniqueId(get(args.data, 'transaction.unique_id'));
    response.setTrsDatetime(
      moment(get(args.data, 'transaction.datetime')).format(
        'YYYY-MM-DD HH:mm:ss'
      )
    );
    response.setTrsAmountTotal(get(args.data, 'transaction.amount.total'));
    response.setPaymentMethod(
      get(args.data, 'transaction.original_transaction.payment_method')
    );
    response.setAcquirer(get(args.data, 'transaction.acquirer'));
    response.setAcquirerUniqueId(
      get(args.data, 'transaction.acquirer_unique_id')
    );
    response.setResponseCode(get(args.data, 'response_code'));
    response.setAuthorizationCode(
      get(args.data, 'transaction.authorization_code')
    );
    response.setStatus(args.error ? 'ERROR' : 'FINISHED');
    response.setData(args.data);
    response.setDataError(error);
    response.setTraceId(args.traceId);
    return response;
  };

  private static getStatus(value: boolean): string {
    return value === true ? 'TECHNICAL_REVERSE' : 'AWAITING';
  }

  public static transform = (
    typeCall: any,
    data: any,
    traceId: any,
    error?: any
  ): TransactionLogDTO => {
    const methods: any = {
      true: this.buildRequest,
      false: this.buildResponse
    };
    const isRequestType: any = /(Request[A-Z])\w+/.test(typeCall);
    const builder: any = methods[isRequestType];
    const dto: TransactionLogDTO = builder({ data, typeCall, traceId, error });
    return dto;
  };
}
