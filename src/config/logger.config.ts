const LOGGER_CONFIG = {
  env: process.env.NODE_ENV,
  envName: 'NODE_ENV',
  envDefault: 'local',
  level: process.env.NODE_LOG_LEVEL || 'info',
  filePath: process.env.NODE_LOG_FILE_PATH || './var/log/pm2/',
  fileNameFormat: process.env.NODE_LOG_FILE_NAME_FORMAT || 'generic',
  fileNameType: process.env.NODE_LOG_FILE_NAME_TYPE || 'service-date-hostname',
  toStdout: process.env.NODE_LOG_TO_STDOUT || 'true',
  toFile: process.env.NODE_LOG_TO_FILE || 'true',
  enabled: process.env.NODE_LOG_ENABLED || 'true',
  serviceName: process.env.NODE_LOG_SERVICE_NAME || 'retry-engine',
  outputFormat: process.env.NODE_LOG_OUTPUT_FORMAT || 'pino-log-generic',
  inputFormat:
    process.env.NODE_LOG_INPUT_FORMAT || 'module-method-description-message',
  internalInterceptors: process.env.NODE_LOG_INTERNAL_INTERCEPTORS || [],
  externalInterceptors: process.env.NODE_LOG_EXTERNAL_INTERCEPTORS || [],
  extraGlobalInfo: process.env.NODE_LOG_EXTRA_GLOBAL_INFO || {
    environment: process.env.NODE_ENV
  },
  setDate: process.env.NODE_LOG_SET_DATE || {
    name: '@timestamp',
    format: 'default'
  },
  nameSpaceHook: process.env.NODE_LOG_NAMESPACE_HOOK || 'app.my-app',
  traceHeaders: process.env.NODE_LOG_TRACE_HEADERS || [
    { header: 'kong-request-id', name: 'trace-id' },
    { header: 'risk-fingerprint', name: 'riskFingerprint' },
    { header: 'jwt-profile_id', name: 'profile-id' },
    { header: 'x-flow-country', name: 'x-flow-country' },
    { header: 'x-flow-service', name: 'x-flow-service' },
    { header: 'bff-name', name: 'bff-name' },
    { header: 'source_version', name: 'os-version' },
    { header: 'source_type', name: 'client-os' },
    { header: 'slave_device_identification', name: 'client-device' },
    { header: 'version', name: 'client-fpay-version' }
  ],
  traceNewValues: process.env.NODE_LOG_TRACE_NEW_VALUES || null,
  isExpress: process.env.NODE_LOG_IS_EXPRESS || 'true'
};

export default LOGGER_CONFIG;
