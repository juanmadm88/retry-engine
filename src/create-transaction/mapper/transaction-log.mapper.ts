import { TransactionLogDTO } from '../dtos/transaction-log.dto';
import * as moment from 'moment';
import { get } from 'lodash';
import buildError from '../../utils/build-error';
export class TransactionLogMapper {
  private static buildRequest = (args: any): TransactionLogDTO => {
    const paramaters: any = {};
    const request: TransactionLogDTO = new TransactionLogDTO(paramaters);
    request.setTrsType(get(args.data, 'request.options.body.transaction_type'));
    request.setTypeCall(args.typeCall);
    request.setTrsUniqueId(
      get(args.data, 'request.options.body.transaction.unique_id')
    );
    request.setTrsDatetime(
      moment(
        get(args.data, 'request.options.body.transaction.datetime')
      ).format('YYYY-MM-DD HH:mm:ss')
    );
    request.setTrsAmountTotal(
      get(args.data, 'request.options.body.transaction.amount.total')
    );
    request.setPaymentMethod(
      get(
        args.data,
        'request.options.body.transaction.original_transaction.payment_method',
        get(args.data, 'request.options.body.metadata.payment_method')
      )
    );
    request.setAcquirer(
      get(
        args.data,
        'request.options.body.transaction.original_transaction.transaction.acquirer'
      )
    );
    request.setAcquirerUniqueId(
      get(
        args.data,
        'request.options.body.transaction.original_transaction.transaction.acquirer_unique_id'
      )
    );
    request.setResponseCode(
      get(
        args.data,
        'request.options.body.transaction.original_transaction.response_code'
      )
    );
    request.setAuthorizationCode(
      get(
        args.data,
        'request.options.body.transaction.original_transaction.transaction.authorization_code'
      )
    );
    request.setStatus(
      this.getStatus(
        get(
          args.data,
          'request.options.body.metadata.transaction.technical_reverse'
        )
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
    response.setTrsType(get(args.data, 'response.transaction_type'));
    response.setTypeCall(args.typeCall);
    response.setTrsUniqueId(
      get(
        args.data,
        'response.transaction.unique_id',
        get(args.data, 'request.options.body.transaction.unique_id')
      )
    );
    response.setTrsDatetime(
      moment(
        get(args.data, 'response.transaction.transaction_datetime')
      ).format('YYYY-MM-DD HH:mm:ss')
    );
    response.setTrsAmountTotal(
      get(args.data, 'response.transaction.amount.total')
    );
    response.setPaymentMethod(
      get(
        args.data,
        'request.options.body.transaction.original_transaction.payment_method'
      )
    );
    response.setAcquirer(get(args.data, 'response.transaction.acquirer'));
    response.setAcquirerUniqueId(
      get(args.data, 'response.transaction.unique_id')
    );
    response.setResponseCode(get(args.data, 'response.response_code'));
    response.setAuthorizationCode(
      get(args.data, 'response.transaction.authorization_code')
    );
    response.setStatus(args.error ? 'ERROR' : 'FINISHED');
    response.setData(args.data.response);
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
