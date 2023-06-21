import { getNamespace } from 'node-request-context';
import LOGGER_CONFIG from '../config/logger.config';

const injectHeaders = (customHeaders: any): void => {
  const namespace = LOGGER_CONFIG.nameSpaceHook;
  const headers: any = LOGGER_CONFIG.traceHeaders;
  const context = getNamespace(namespace);
  if (context && customHeaders) {
    context.run(() => {
      headers.forEach((e) => {
        const h = customHeaders[e.header];
        if (h) context.set(e.name, h);
      });
    });
  }
};

export default injectHeaders;
