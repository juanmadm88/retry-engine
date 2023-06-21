import * as Joi from '@hapi/joi';

// Schema de validacion de config
export const configValidationSchema = Joi.object({
  EXPRESS_PORT: Joi.number().default(3056),
  APP_NAME: Joi.string().required(),
  NEST_ENV: Joi.string().required(),
  FASTIFY_PORT: Joi.number().default(3056),
  FASTIFY_FM_HTTP: Joi.string(),
  FASTIFY_FM_LOGGER: Joi.string(),
  RABBIT_PROTOCOL: Joi.string().required(),
  RABBIT_USER: Joi.string().required(),
  RABBIT_PASS: Joi.string().required(),
  RABBIT_HOST: Joi.string().required(),
  RABBIT_PORT: Joi.string().required(),
  RABBIT_VHOST: Joi.string().required(),
  RABBIT_QUEUE_NAME: Joi.string().required(),
  MONGO_DB_URI: Joi.string().required(),
  MONGO_DB_USER: Joi.string().required(),
  MONGO_DB_PASS: Joi.string().required(),
  CRON_VALUE: Joi.string().required(),
  TIME_SERIE: Joi.string().required()
});
