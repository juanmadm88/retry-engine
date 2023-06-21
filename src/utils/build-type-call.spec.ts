import { TypeCall } from './common';
import { Constants } from '../constants';
import buildTypeCall from './build-type-call';
describe('buildTypeCall', () => {
  it('expect CMR reponse and request type call ', () => {
    const response: TypeCall = buildTypeCall('someTypeCall');
    expect(response.request).toBe(Constants.cmrTypeCall.request);
    expect(response.response).toBe(Constants.cmrTypeCall.response);
  });
  it('expect transbank reponse and request type call ', () => {
    const response: TypeCall = buildTypeCall('transbank');
    expect(response.request).toBe(Constants.REQUEST_TBK);
    expect(response.response).toBe(Constants.RESPONSE_TBK);
  });
  it('expect interOp reponse and request type call ', () => {
    const response: TypeCall = buildTypeCall('interop');
    expect(response.request).toBe(Constants.REQUEST_INTEROP);
    expect(response.response).toBe(Constants.RESPONSE_INTEROP);
  });
});
