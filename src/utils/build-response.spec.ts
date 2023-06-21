import { TransactionLogDTO } from '../create-transaction/dtos';
import buildResponse from './build-response';

describe('buildResponse', () => {
  it('expect return TransactionLogDTO ', () => {
    const response: any = buildResponse('TransactionLogDTO', {
      trs_unique_id: '123456'
    });
    expect(response.getTrsUniqueId()).toBe('123456');
    expect(response).toBeInstanceOf(TransactionLogDTO);
  });
  it('expect return an empty TransactionLogDTO ', () => {
    const response: any = buildResponse('TransactionLogDTO');
    expect(response).toBeInstanceOf(TransactionLogDTO);
    expect(Object.keys(response).length).toBe(0);
  });
});
