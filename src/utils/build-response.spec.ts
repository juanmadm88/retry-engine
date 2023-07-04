import { TransactionLogDTO } from '../create-transaction/dtos';
import buildResponse from './build-response';
import mongoose from 'mongoose';

describe('buildResponse', () => {
  it('expect return TransactionLogDTO ', () => {
    const id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId();
    const response: TransactionLogDTO = buildResponse('TransactionLogDTO', {
      trs_unique_id: '123456',
      _id: id
    });
    expect(response).toBeInstanceOf(TransactionLogDTO);
    expect(response.getTrsUniqueId()).toBe('123456');
    expect(response.getId()).toBe(id.toString());
  });
  it('expect a TransactionLogDTO when object to transform is undefined ', () => {
    const response: TransactionLogDTO = buildResponse(
      'TransactionLogDTO',
      undefined
    );
    expect(response).toBeInstanceOf(TransactionLogDTO);
  });
});
