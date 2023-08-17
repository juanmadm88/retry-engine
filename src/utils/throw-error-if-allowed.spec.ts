import throwErrorIfAllowed from './throw-error-if-allowed';
describe('throwErrorIfAllowed', () => {
  it('expect error to be defined ', async () => {
    try {
      await throwErrorIfAllowed(
        'interop',
        { code: '00', status: 3, description: 'some description' },
        ['3', '5']
      );
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('expect error not to be thrown ', async () => {
    await throwErrorIfAllowed('interop', {}, ['3', '5']);
  });
  it('expect error not to be thrown ', async () => {
    await throwErrorIfAllowed('interop');
  });
  it('expect error not to be thrown ', async () => {
    await throwErrorIfAllowed(
      'transbank',
      { status: 3, description: 'some description' },
      ['3', '5']
    );
  });
  it('expect error.response.status to be equals "500"  ', async () => {
    try {
      await throwErrorIfAllowed(
        'interop',
        { status: 3, description: 'some description' },
        ['3', '5']
      );
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.response.status).toBe('3');
    }
  });
  it('expect error.response.status to be equals "400"  ', async () => {
    try {
      await throwErrorIfAllowed(
        'interop',
        { status: 2, description: 'some description' },
        ['3', '5']
      );
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.response.status).toBe('2');
    }
  });
  it('expect error.response.status to be equals "700"  ', async () => {
    try {
      await throwErrorIfAllowed(
        'interop',
        { status: 2, description: 'some description' },
        ['2', '3', '5']
      );
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.response.status).toBe('2');
    }
  });
});
