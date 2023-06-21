import allowedToRetry from './allowed-to-retry';
describe('allowedToRetry', () => {
  it('expect to be false ', () => {
    const failCodes: string[] = ['500'];
    const statusCode: any = '300',
      error: any = {};
    const timeoutCodes: string[] = ['ESOCKETTIMEDOUT'];
    const response: boolean = allowedToRetry(
      statusCode,
      failCodes,
      error,
      timeoutCodes
    );
    expect(response).toBe(false);
  });
  it('expect to be true ', () => {
    const failCodes: string[] = ['500'];
    const statusCode: any = '300',
      error: any = { code: 'ESOCKETTIMEDOUT' };
    const timeoutCode: string[] = ['ESOCKETTIMEDOUT'];
    const response: boolean = allowedToRetry(
      statusCode,
      failCodes,
      error,
      timeoutCode
    );
    expect(response).toBe(true);
  });
});
