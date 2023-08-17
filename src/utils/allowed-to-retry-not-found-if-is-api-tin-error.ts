import { HttpStatus } from '@nestjs/common';
import { Constants } from '../constants';

const allowedToRetryNotFoundIfIsApiTinError = (
  error: any = {},
  businessName: string
): boolean => {
  if (!Constants.BUSINESS_NAMES.includes(businessName)) return true;
  if (Number(error.response?.status) !== HttpStatus.NOT_FOUND) return true;
  return (
    error.response?.data?.code === '05' ||
    Number(error.response?.data?.status) === 5
  );
};

export default allowedToRetryNotFoundIfIsApiTinError;
