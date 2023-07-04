import { Transport } from '@nestjs/microservices';

const baseConfig = {
  app_name: process.env.APP_NAME || 'retry-engine',
  express_port: parseInt(process.env.EXPRESS_PORT) || 8080,
  fastify_port: parseInt(process.env.FASTIFY_PORT) || 8080,
  black_list: process.env.BLACKLIST_DATA || 'test,test',
  country: process.env.NODE_APP_COUNTRY || 'pe',
  env: process.env.NODE_ENV || 'local',
  app_version: process.env.npm_package_version,
  tbk_mall_service: {
    base_url: process.env.TBK_MALL_ADAPTER_BASE_URL || '',
    api_key: process.env.TBK_MALL_ADAPTER_API_KEY || ' ',
    api_key_secret: process.env.TBK_MALL_ADAPTER_API_KEY_SECRET || ' '
  },
  api_tin: {
    endpoint: process.env.API_TIN_ENDPOINT || ' ',
    api_key: process.env.API_TIN_API_KEY || ' ',
    allowedCodesToRetry: JSON.parse(
      process.env.API_TIN_ALLOWED_CODES_TO_RETRY || '["3","5"]'
    )
  },
  rabbitConfig: {
    transport: Transport.RMQ,
    options: {
      urls: [
        `${process.env.RABBIT_PROTOCOL || 'amqp'}://${
          process.env.RABBIT_USER || 'guest'
        }:${process.env.RABBIT_PASS || 'guest'}@${
          process.env.RABBIT_HOST || 'localhost'
        }:${process.env.RABBIT_PORT || '5672'}/${
          process.env.RABBIT_VHOST || '/'
        }`
      ],
      noAck: JSON.parse(process.env.RABBIT_ACK || 'false'),
      queue: process.env.RABBIT_QUEUE_NAME || ' ',
      queueOptions: {
        durable: true,
        prefetchCount: parseInt(process.env.RABBIT_PREFETCH_COUNT, 10) || 1
      }
    }
  },
  redisConfig: {
    port: parseInt(process.env.REDIS_PORT),
    host: process.env.REDIS_HOSTNAME,
    password: process.env.REDIS_PRIMARY_ACCESS_KEY,
    ttl: process.env.NODE_REDIS_TTL
  },
  rabbitProducerConfig: {
    transport: Transport.RMQ,
    options: {
      urls: [
        `${process.env.RABBIT_PRODUCER_PROTOCOL || 'amqp'}://${
          process.env.RABBIT_PRODUCER_USER || 'guest'
        }:${process.env.RABBIT_PRODUCER__PASS || 'guest'}@${
          process.env.RABBIT_PRODUCER_HOST || 'localhost'
        }:${process.env.RABBIT_PRODUCER_PORT || '5672'}/${
          process.env.RABBIT_PRODUCER_VHOST || '/'
        }`
      ],
      noAck: JSON.parse(process.env.RABBIT_PRODUCER_ACK || 'false'),
      queue: process.env.RABBIT_PRODUCER_QUEUE_NAME || ' ',
      queueOptions: {
        durable: true,
        prefetchCount:
          parseInt(process.env.RABBIT_PRODUCER_PREFETCH_COUNT, 10) || 1
      },
      serializer: {
        serialize(value: any) {
          return value.data;
        }
      }
    }
  },
  timeSerie: JSON.parse(
    process.env.TIME_SERIE ||
      '{"1":3,"2":5,"3":8,"4":13,"5":21,"6":34,"7":55,"8":89,"9":144,"10":233,"11":377,"12":619,"13":987,"14":1597,"15":2584,"16":4181,"17":6765,"18":10946,"19":17711,"20":28657,"21":46368,"22":75025,"23":121393}'
  ),
  timeoutCodes: JSON.parse(
    process.env.TIMEOUT_CODES ||
      '["ESOCKETTIMEDOUT","ETIMEDOUT","ECONNABORTED"]'
  ),
  failCodes: JSON.parse(
    process.env.FAIL_CODES || '["408","500","502", "3","5"]'
  ),
  numberOfTrxToProcess:
    parseInt(process.env.NUMBER_OF_TRANSACTION_TO_PROCCESS) || 20,
  cronValue: process.env.CRON_VALUE || '*/30 * * * * *',
  mongoConnection: {
    uri: process.env.MONGO_DB_URI || ' ',
    user: process.env.MONGO_DB_USER || ' ',
    pass: process.env.MONGO_DB_PASS || ' ',
    tls: JSON.parse(process.env.TLS || 'true')
  }
};

const setVarsEnv = (aditionalEnvConfig = {}) => {
  return { ...baseConfig, aditionalEnvConfig };
};

export const environmentConfig = {
  local: setVarsEnv(),
  test: setVarsEnv(),
  int: setVarsEnv(),
  qa: setVarsEnv(),
  prod: setVarsEnv()
};
