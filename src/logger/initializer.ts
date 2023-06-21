/* eslint-disable prettier/prettier */
import { INestApplication } from '@nestjs/common';
import { setLoggerConfig, node } from '@payments/common-logger';
import {
  distributedTracing,
  initializeTraceHeaders,
} from 'distributed-tracing';


export class InitLogger {
  /**
   * Añade la configuracion basica del logger
   * @param configFile Json con la configuracion del logger
   */
  public static setConfig(configFile: object): void {
    setLoggerConfig(configFile);
  }

  /**
   * Añade tracing a la configuracion del logger y lo agrega como middleware
   * @param app Instancia de Nest
   */
  public static addTracing(app: INestApplication, spaceHook: string, contextName: string ): void {
    const { asyncHookCreate, traceMiddleware, getTraceHeaders } = node;
    const asyncHook = asyncHookCreate(spaceHook);
    distributedTracing(getTraceHeaders);
    app.use(initializeTraceHeaders(contextName));
    app.use(traceMiddleware(asyncHook));
    
  }
}
