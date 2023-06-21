import { node, obfuscate } from '@payments/common-logger';

export interface ILogger {
  info(method: string, description: string, message?: any): void;
  warn(method: string, description: string, message?: any): void;
  error(method: string, description: string, error: Error, message?: any): void;
}

export class LoggerService implements ILogger {
  private module: string;
  private underlying: any;

  constructor(module: string) {
    this.module = module;
    this.underlying = node.Logger.getLogger();
  }

  public info(method: string, description: string, message?: any): void {
    this.underlying.info(this.buildLog(method, description, message));
  }

  public warn(method: string, description: string, message?: any): void {
    this.underlying.info(this.buildLog(method, description, message));
  }

  public error(
    method: string,
    description: string,
    error: Error,
    message?: any
  ): void {
    this.underlying.error({
      ...this.buildLog(method, description, message),
      error
    });
  }

  private buildLog(method: string, description: string, message: any): object {
    return {
      module: this.module,
      method,
      description,
      message:
        typeof message === 'object'
          ? JSON.stringify(obfuscate(message))
          : message
    };
  }
}
