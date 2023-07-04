import generateKey from './generate-key';
describe('GenerateKey', () => {
  it('expect pe-interop key to be returned', () => {
    const expectedKey = 'pe-interop';
    const response: string = generateKey({
      country: 'pe',
      acquirer: 'interop'
    });
    expect(response).toBe(expectedKey);
  });
});
