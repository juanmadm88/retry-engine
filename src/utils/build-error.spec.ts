import buildError from './build-error';

describe('buildError', () => {
  it('expect return to has only one key ', () => {
    const error: object = buildError();
    expect(Object.keys(error).length === 1).toBe(true);
  });
  it('expect return to has 2 keys ', () => {
    const arg: any = {
      code: 'some Code',
      message: 'some message'
    };
    const error: object = buildError(arg);
    expect(Object.keys(error).length === 2).toBe(true);
  });
  it('expect return to has 3 keys ', () => {
    const arg: any = {
      code: 'some Code',
      message: 'some message',
      response: {
        status: 500
      }
    };
    const error: object = buildError(arg);
    expect(Object.keys(error).length === 3).toBe(true);
  });
});
