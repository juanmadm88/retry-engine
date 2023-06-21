const mockSet = jest.fn();
const mockContext = {
  getNamespace: jest.fn().mockImplementation(() => ({
    run: jest.fn((callback) => callback()),
    set: mockSet
  }))
};
jest.mock('node-request-context', () => mockContext);
import injectHeaders from './inject-headers';
describe('injectHeaders', () => {
  it('expect method "set" to be called ', () => {
    const spy = jest.spyOn(mockContext.getNamespace(), 'set');
    const customHeaders: any = {
      'kong-request-id': 'someTraceId'
    };
    injectHeaders(customHeaders);
    expect(spy).toBeCalled();
  });
});
