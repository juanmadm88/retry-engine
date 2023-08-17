import { Error } from '../utils/common';

const buildError = (anError: any = {}): Error => {
  const response: Error = {};
  const responseData: any = anError.response?.data;
  response.code = responseData?.code || anError.code;
  response.status = responseData?.status || anError.response?.status;
  response.message =
    responseData?.message || responseData?.description || anError.message;
  return response;
};

export default buildError;
