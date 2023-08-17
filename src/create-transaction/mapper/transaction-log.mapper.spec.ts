import { TransactionLogDTO } from '../dtos';
import { TransactionLogMapper } from './transaction-log.mapper';

describe('TransactionLogMapper', () => {
  it('expect TransactionLogDTO with type_call "RequestCMR" to be created ', () => {
    const typeCall = 'RequestCMR';
    const traceId: any = 'someTraceId';
    const data: any = {
      options: {
        body: {
          transaction_type: 'SALE',
          metadata: {
            transaction: {
              technical_reverse: true
            },
            payment_method: 'CREDIT'
          }
        }
      }
    };
    const response: TransactionLogDTO = TransactionLogMapper.transform(
      typeCall,
      data,
      traceId
    );
    expect(response).toBeInstanceOf(TransactionLogDTO);
    expect(Object.keys(response).length > 0).toBeTruthy();
    expect(response.getTypeCall()).toBe('RequestCMR');
  });
  it('expect TransactionLogDTO with type_call "ResponseCMR" to be created ', () => {
    const typeCall: any = 'ResponseCMR';
    const traceId: any = 'someTraceId';
    const data: any = {
      options: {
        body: {
          transaction_type: 'SALE',
          metadata: {
            transaction: {
              technical_reverse: true
            }
          }
        }
      }
    };
    const response: TransactionLogDTO = TransactionLogMapper.transform(
      typeCall,
      data,
      traceId
    );
    expect(response).toBeInstanceOf(TransactionLogDTO);
    expect(Object.keys(response).length > 0).toBeTruthy();
    expect(response.getTypeCall()).toBe('ResponseCMR');
  });
  it('expect TransactionLogDTO with type_call "RequestCMR" and status "TECHNICAL_REVERSE" to be created ', () => {
    const typeCall: any = 'RequestCMR';
    const traceId: any = 'someTraceId';
    const data: any = {
      request: {
        options: {
          body: {
            transaction_type: 'SALE',
            metadata: {
              transaction: {
                technical_reverse: true
              }
            }
          }
        }
      }
    };
    const response: TransactionLogDTO = TransactionLogMapper.transform(
      typeCall,
      data,
      traceId
    );
    expect(response).toBeInstanceOf(TransactionLogDTO);
    expect(Object.keys(response).length > 0).toBeTruthy();
    expect(response.getTypeCall()).toBe('RequestCMR');
    expect(response.getStatus()).toBe('TECHNICAL_REVERSE');
  });
});
