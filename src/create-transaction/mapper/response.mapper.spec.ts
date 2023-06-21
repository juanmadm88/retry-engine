import { ResponseDTO } from '../dtos';
import { ResponseMapper } from './response.mapper';

describe('ResponseMapper', () => {
  it('expect ResponseMapperDTO to be created ', () => {
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
    const response: any = {
      code: '00',
      description: 'some description'
    };
    const result: ResponseDTO = ResponseMapper.transform(data, response);
    expect(result).toBeInstanceOf(ResponseDTO);
    expect(Object.keys(result).length > 0).toBeTruthy();
  });
});
