import { Error } from '../utils/common';
import { Constants } from '../constants';
const isAllowedResponse = (response: any, allowedCodes: string[]): boolean => {
  return allowedCodes.includes(String(response.status));
};

const throwErrorIfAllowed = (
  businessName: string,
  response: any = {},
  allowedStatusCodesToRetry: string[] = []
): Promise<Error> => {
  if (
    Constants.BUSINESS_NAMES.includes(businessName) &&
    isAllowedResponse(response, allowedStatusCodesToRetry)
  ) {
    const returned: Error = {
      code: response?.code,
      message: response?.description,
      response: {
        status: String(response?.status)
      }
    };
    return Promise.reject(returned);
  }
};

export default throwErrorIfAllowed;
