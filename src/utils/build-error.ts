import { Error } from '../utils/common';

const buildError = (anError: any = {}): Error => {
  const response: Error = {};
  if (anError.code) response.code = anError.code;
  if (anError.response?.status) response.status = anError.response.status;
  response.message = anError.response?.data?.message || anError.message;
  return response;
};

export default buildError;
