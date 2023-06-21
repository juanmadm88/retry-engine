import { registerAs } from '@nestjs/config';
import { environmentConfig } from './envs.config';
/**
 *  Basic config for: Local - test - int - qa - prod
 */
export const appConfig = registerAs(
  'appConfig',
  () => environmentConfig[process.env.NEST_ENV?.toLowerCase() || 'local']
);
