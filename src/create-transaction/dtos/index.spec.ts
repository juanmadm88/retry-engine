import { ResponseDTO, TransactionLogDTO } from './index';

describe('Index ', () => {
  it('Expect DTOS to be defined', () => {
    expect(TransactionLogDTO).toBeDefined();
    expect(ResponseDTO).toBeDefined();
  });
});
