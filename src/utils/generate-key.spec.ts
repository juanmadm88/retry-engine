import generateKey from './generate-key';
describe('GenerateKey', () => {
  it('expect interop-pe key to be returned', () => {
    const expectedKey = 'interop-pe';
    const response: string = generateKey({
      country: 'pe',
      acquirer: 'interop'
    });
    expect(response).toBe(expectedKey);
  });
  it('expected interop-pe to be returned ', () => {
    const expectedKey = 'interop-pe';
    const response: string = generateKey({
      country: 'pe',
      acquirer: 'interop',
      enabled: undefined
    });
    expect(response).toBe(expectedKey);
  });
  it('expected and empty key to be returned ', () => {
    const expectedKey = '';
    const response: string = generateKey(undefined);
    expect(response).toBe(expectedKey);
  });
});
