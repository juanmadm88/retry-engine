import buildError from './build-error';

describe('buildError', () => {
  it('expect return to has 3 keys ', () => {
    const arg: any = {
      response: {
        data: {
          code: '00',
          description: 'some description'
        },
        status: 500
      }
    };
    const error: object = buildError(arg);
    expect(Object.keys(error).length === 3).toBe(true);
  });
});
