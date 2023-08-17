import allowedToRetryNotFoundIfIsApiTinError from './allowed-to-retry-not-found-if-is-api-tin-error';

describe('allowedToRetryNotFoundIfIsApiTinError', () => {
  it('expect to be true ', () => {
    expect(
      allowedToRetryNotFoundIfIsApiTinError(
        { status: '404', response: { data: { code: '05' } } },
        'interop'
      )
    ).toBe(true);
  });
  it('expect to be true ', () => {
    expect(
      allowedToRetryNotFoundIfIsApiTinError({ status: '404' }, 'some acquirer')
    ).toBe(true);
  });
  it('expect to be true ', () => {
    expect(
      allowedToRetryNotFoundIfIsApiTinError(undefined, 'some acquirer')
    ).toBe(true);
  });
  it('expect to be true ', () => {
    expect(
      allowedToRetryNotFoundIfIsApiTinError(
        { status: '404', response: { data: { status: 5 } } },
        'interop'
      )
    ).toBe(true);
  });
  it('expect to be false ', () => {
    expect(
      allowedToRetryNotFoundIfIsApiTinError(
        { response: { data: undefined, status: '404' } },
        'interop'
      )
    ).toBe(false);
  });
  it('expect to be false ', () => {
    expect(
      allowedToRetryNotFoundIfIsApiTinError(
        { response: { status: '404' } },
        'interop'
      )
    ).toBe(false);
  });
});
