import validateWrongObjectId from './validate-wrong-object-id';
describe('validateWrongObjectId', () => {
  it('expect to be false ', async () => {
    const response = validateWrongObjectId('123');
    expect(response).toBeFalsy();
  });
  it('expect to be true ', async () => {
    const response = validateWrongObjectId('551137c2f9e1fac808a5f572');
    expect(response).toBeTruthy();
  });
});
