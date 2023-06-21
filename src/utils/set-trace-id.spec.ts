import setTraceId from './set-trace-id';

describe('setTraceId', () => {
  it('should expect field trace_id field ', () => {
    const someData: any = {};
    setTraceId(someData, { 'kong-request-id': 'someTraceId' });
    expect(someData.trace_id).toBeDefined();
    expect(someData.trace_id).toStrictEqual('someTraceId');
  });
});
