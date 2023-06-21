import {
  TransactionLog,
  TransactionLogSchema
} from '../schemas/transaction-log.schema';

describe('TransactionLogSchema', () => {
  it('expect to be defined', async () => {
    expect(TransactionLog).toBeDefined();
    expect(TransactionLogSchema).toBeDefined();
  });
});
