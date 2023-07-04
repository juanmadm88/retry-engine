import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { ILogger, LoggerService } from '../logger/logger.service';
import { catchError, tap, throwError } from 'rxjs';
@Injectable()
export class HttpInterceptor implements NestInterceptor {
  private logger: ILogger;
  constructor() {
    this.logger = new LoggerService(this.constructor.name);
  }
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const dataLogRequest = {
      path: request.path,
      body: request.body,
      headers: request.headers
    };
    this.logger.info(this.intercept.name, 'Request Data ', dataLogRequest);

    return next.handle().pipe(
      tap(() => {
        this.logger.info(
          this.intercept.name,
          `Logging Response Status Code ${response?.statusCode} from ${request?.method} ${request?.url}`
        );
      }),
      catchError((err) => {
        this.logger.error(this.intercept.name, 'Intercepting Error ', err);
        return throwError(() => err);
      })
    );
  }
}
