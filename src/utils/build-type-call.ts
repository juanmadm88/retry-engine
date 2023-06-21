import { Constants } from '../constants';
import { TypeCall } from './common';
const buildTypeCall = (businessName: string): TypeCall => {
  if (!Constants.typesCall[businessName]) return Constants.cmrTypeCall;
  return Constants.typesCall[businessName];
};

export default buildTypeCall;
