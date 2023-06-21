import * as moment from 'moment';
import { ResponseDTO } from '../dtos';
import { get } from 'lodash';

export class ResponseMapper {
  public static transform = (request: any, response: any): ResponseDTO => {
    const parameters: any = {};
    const dto: ResponseDTO = new ResponseDTO(parameters);
    dto.setTransactionType(get(request, 'options.body.transaction_type'));
    dto.setPaymentMethod(get(request, 'options.body.metadata.payment_method'));
    dto.setResponseCode(get(response, 'code'));
    dto.setResponseDescription(get(response, 'description'));
    dto.setTransaction({
      unique_id: get(request, 'options.body.transaction.unique_id'),
      transaction_datetime: moment(
        get(request, 'options.body.transaction.datetime')
      ).format('YYYY-MM-DD HH:mm:ss')
    });
    return dto;
  };
}
